from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from django.http import HttpResponse, JsonResponse, Http404
from django.contrib.auth.models import auth, User
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.exceptions import ObjectDoesNotExist
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

import os, zipfile, subprocess, logging

User = get_user_model()
logger = logging.getLogger('django')

#Using apis - 
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,generics, views
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from .serializers import RegisterSerializer, LoginSerializer, AreaSerializer, PointSerializer, UserSerializer, UpdateUserSerializer, CustomTokenRefreshSerializer
from .models import Area_model, Point_model, CustomUser, UserProducts
from . forms import CreateUserForm, LoginForm
from .permissions import IsTokenValid


#For JWT
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenViewBase
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.authentication import JWTAuthentication


#constants
from .app_constants import BASE_DIR


########################################## JWT TOKEN ##########################################

class CustomTokenRefreshView(TokenViewBase):
    serializer_class = CustomTokenRefreshSerializer
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data

        current_time = timezone.now()
        access_token_lifetime = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
        expiry_time = current_time + access_token_lifetime

        response_data = {
            'access': data['access'],
            'refresh': data.get('refresh', request.data.get('refresh')),  # Ensure the refresh token is included
            'current_time': current_time.strftime('%Y-%m-%d %H:%M:%S'),
            'expired_at': expiry_time.strftime('%Y-%m-%d %H:%M:%S'),
        }

        return Response(response_data, status=status.HTTP_200_OK)

####################################################################################

########################################## USER DATA ########################################## 

class RegisterAPI(APIView):
    permission_classes = [AllowAny]  # Allow any user to register

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                try:
                    user = serializer.save()
                except Exception as e:
                    logger.error(f"User:{request.user.username} - An error occurred while saving user : {str(e)}")
                    return Response({"error": f"An error occurred while saving user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                try:
                    print(request.data['role'])
                    if(request.data['role'] == 'agency'):
                        UserProducts.objects.create(
                            username=user,
                            HRRR_TP=True,
                            HRRR_PR=True,
                            HRRR15_PR=True,
                            GFS_TP=True,
                            BLEND_TP=True,
                            QPE_15m=True,
                            QPE_1hr=True,
                            QPE_PR=True
                        )
                except Exception as e:
                    logger.error(f"User:{user.username} - An error occurred while creating UserProducts : {str(e)}")
                    return Response({"error": f"An error occurred while creating UserProducts: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                try:
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        "message": "User registered successfully",
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    }, status=status.HTTP_201_CREATED)
                except Exception as e:
                    logger.error(f"User:{request.user.username} - An error occurred while generating tokens : {str(e)}")
                    return Response({"error": f"An error occurred while generating tokens: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            logger.error(f"User:{request.user.username} - 400 Bad request")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred While registering the user : {str(e)}")
            return Response({"error": f"An error occurred While registering the user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateUserView(generics.UpdateAPIView):
    serializer_class = UpdateUserSerializer
    permission_classes = [IsAdminUser, IsTokenValid]
    queryset = User.objects.all()  # Optional queryset

    def get_object(self):
        user_id = self.kwargs.get('pk')  # Assuming 'pk' is used in URL conf (/api/user/update/<pk>/)
        user = get_object_or_404(User, pk=user_id)
        return user

    def put(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            serializer = self.get_serializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            logger.error(f"User:{request.user.username} - 400 Bad request")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Http404 as e:
            logger.error(f"User:{request.user.username} - 404 Not Found")
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred while updating the User Details: {str(e)}")
            return Response({"error": f"An error occurred while updating the User Details: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetailView(generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser, IsTokenValid]
    queryset = User.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            user_id = request.query_params.get('id')
            if user_id is None:
                return Response({"error": "User id not provided in request"}, status=status.HTTP_400_BAD_REQUEST)
            instance = User.objects.get(pk=user_id)
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.error(f"User:{request.user.username} - User does not exist:404 Not Found")
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred:500 Internal Server Error")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AllUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser, IsTokenValid]
    def get_queryset(self):
        try:
            queryset = User.objects.all()
            return queryset
        except Exception as e:
            logger.error(f"Admin - Error occured while retrieving all Users:500 Internal Server Error")
            return Response("Error occured while retrieving all Users - \n"+e,status=status.HTTP_500_INTERNAL_SERVER_ERRO)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Admin - Error occured while retrieving all Users:500 Internal Server Error")
            return Response({"error": f"An error occurred while retrieving users: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


##########################################  LOGIN-LOGOUT ########################################## 
class LoginAPI(APIView):
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                username = serializer.data['username']
                password = serializer.data['password']
                try:
                    user = authenticate(request, username=username, password=password)
                except Exception as e:
                    logger.error(f"User:{request.user.username} - An error occurred during authentication:500 Internal Server Error")
                    return Response({"error": f"An error occurred during authentication: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                if user is not None:
                    try:
                        login(request, user)
                    except Exception as e:
                        logger.error(f"User:{request.user.username} - An error occurred during login:500 Internal Server Error")
                        return Response({"error": f"An error occurred during login: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
                    try:
                        current_time = timezone.now()
                        access_token_lifetime = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
                        expiry_time = current_time + access_token_lifetime
                        
                        refresh = RefreshToken.for_user(user)
                        user_data = {
                            'username': user.username,
                            'email': user.email,
                            'agency': user.agency,
                            'county': user.county,
                            'role': user.role,
                            'isActive': user.isActive
                        }
                        return Response({
                            "message": "Login successful",
                            "refresh": str(refresh),
                            "access": str(refresh.access_token),
                            "user_data":user_data,
                            "expired_at": expiry_time.strftime('%Y-%m-%d %H:%M:%S'),
                            "current_time": current_time.strftime('%Y-%m-%d %H:%M:%S'),
                        }, status=status.HTTP_200_OK)
                    except Exception as e:
                        logger.error(f"User:{user.username} - An error occurred while generating tokens:500 Internal Server Error")
                        return Response({"error": f"An error occurred while generating tokens: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                logger.error(f"Invalid credentials:401 Unautorized")
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            logger.error(f"User:{request.user.username} - 400 Bad Request")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred:500 Internal Server Error")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutAPI(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]

    def post(self, request, *args, **kwargs):
        if request.user:
            try:
                refresh_token = request.data.get('refresh')
                auth_header = request.headers.get('Authorization')
                access_token = auth_header.split(' ')[1]
                if refresh_token:
                    refresh_token_obj = RefreshToken(refresh_token)
                    cache.set(refresh_token_obj['jti'], True, timeout=refresh_token_obj.lifetime.total_seconds())
                if access_token:
                    access_token_obj = AccessToken(access_token)
                    cache.set(access_token_obj['jti'], True, timeout=access_token_obj.lifetime.total_seconds())
                logger.info(f"User:{request.user.username} - User logged out successfully")
                return Response({"success": "User logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
            except Exception as e:
                logger.error(f"User:{request.user.username} - 400 Bad Request")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            logger.error(f"User:{request.user.username} - 401 User Unauthroized")
            return Response({"error": "User not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)


#################################################################################### 

####################################### AREA and POINT  #############################################

class AreaModelCreateView(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]

    def post(self, request, *args, **kwargs):
        serializer = AreaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User:{request.user.username} - 201 Created")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"User:{request.user.username} - 400 Bad Request")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, *args, **kwargs):
        username = request.user.username
        try:
            area = Area_model.objects.get(username=username)
            serializer = AreaSerializer(area)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Area_model.DoesNotExist:
            logger.error(f"User:{request.user.username} - 404 Username not found")
            return Response({"error": "Username not found"}, status=status.HTTP_404_NOT_FOUND)

class AreaModelUpdateView(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]
    def get_object(self, username):
        try:
            return Area_model.objects.get(username=username)
        except Area_model.DoesNotExist:
            raise Http404

    def put(self, request, format=None):
        username = request.user.username
        area = self.get_object(username)
        serializer = AreaSerializer(area, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        logger.error(f"User:{request.user.username} - 400 Bad Request")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PointModelCreateView(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]

    def post(self, request, *args, **kwargs):
        serializer = PointSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"User:{request.user.username} - 400 Bad Request")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, *args, **kwargs):
        username = request.user.username
        try:
            simple_area = Point_model.objects.filter(username=username)
            serializer = PointSerializer(simple_area,many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Point_model.DoesNotExist:
            logger.error(f"User:{request.user.username} - 404 Username not found")
            return Response({"error": "Username not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, *args, **kwargs):
        username = request.data.get('username')
        point_x = request.data.get('point_x')
        point_y = request.data.get('point_y')

        if not (username and point_x and point_y):
            logger.error(f"User:{request.user.username} - Username, point_x, and point_y are required - 400 Bad Request")
            return Response({"error": "Username, point_x, and point_y are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            point = Point_model.objects.get(username=username, point_x=point_x, point_y=point_y)
            point.delete()
            logger.info(f"User:{request.user.username} - Point Deleted Successfully")
            return Response({"message": "Point deleted successfully"}, status=status.HTTP_200_OK)
        except Point_model.DoesNotExist:
            logger.error(f"User:{request.user.username} - 404 Point not found")
            return Response({"error": "Point not found"}, status=status.HTTP_404_NOT_FOUND)

################################################################################################################


########################################################## JWT Token  ######################################################
#JWT Token Authentication Code

class VerifyTokenAPI(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]

    def get(self, request):
        try:
            user = request.user
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email
            })
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred while verifying token: {str(e)} - 500 Internal Server Error")
            return Response({"error": f"An error occurred while verifying token: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MyTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred while validating the serializer: {str(e)} - 400 Bad Request")
            return Response({"error": f"An error occurred while validating the serializer: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            return Response({
                'access': str(serializer.validated_data['access']),
                'refresh': str(refresh),
            })
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred while generating tokens: {str(e)} - 500 Internal Server Error")
            return Response({"error": f"An error occurred while generating tokens: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MyTokenRefreshView(TokenRefreshView):
    pass

################################################################################################################

########################################### FILE MANUPULATION #####################################################################

class UserDataAPIView(generics.ListAPIView):
    serializer_class = AreaSerializer  # Use AreaSerializer for response
    permission_classes = [IsAuthenticated,IsTokenValid]

    def get_queryset(self):
        try:
            username = self.request.user.username
            area_queryset = Area_model.objects.filter(username=username)
            return area_queryset
        except Exception as e:
            logger.error(f"User:{username} - Error occured while querying the Area table on user data request - 500 Internal Server Error")
            return Response("Error occured while querying the Area table on user data request - \n"+e,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def list(self, request, *args, **kwargs):
        try:
            username = request.user.username
            area_queryset = self.get_queryset()
            point_queryset = Point_model.objects.filter(username=username)

            area_serializer = self.serializer_class(area_queryset, many=True)
            point_serializer = PointSerializer(point_queryset, many=True)
        except Exception as e:
            logger.error(f"User:{request.user.username} - Error occured while fetching Area and Point Data on user data request - 500 Internal Server Error")
            return Response("Error occured while fetching Area and Point Data on user data request - \n"+e,status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'areas': area_serializer.data,
            'points': point_serializer.data
        })
    
#Create json file and store in that output folder - 
class ExportUserDataView(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]

    def get(self, request):
        username = request.user.username
        try:
            area = Area_model.objects.get(username=username)
            # Serialize area data
            area_data = {
                "P1": {"lat":area.point1_y,"lon":area.point1_x},
                "P2": {"lat":area.point2_y,"lon":area.point2_x},
                "P3": {"lat":area.point3_y,"lon":area.point3_x},
                "P4": {"lat":area.point4_y,"lon":area.point4_x}
            }
        except Area_model.DoesNotExist:
            area_data = None

        # Fetch related points
        try:
            points = Point_model.objects.filter(username=username)
            points_data = {
                point.point_name: {
                    "lat": point.point_y,
                    "lon": point.point_x,
                }
                for point in points
            }
        except Point_model.DoesNotExist:
            points_data={}
        
        # Retrieve user data for the given username
        try:
            user_details = CustomUser.objects.get(username=username)
            county = user_details.county
            agency = user_details.agency
        except CustomUser.DoesNotExist:
            county = None
            agency = None

        user_products = UserProducts.objects.get(username=username)
        user_products_data = {
            "HRRR_TP": user_products.HRRR_TP,
            "HRRR_PR": user_products.HRRR_PR,
            "HRRR15_PR": user_products.HRRR15_PR,
            "GFS_TP": user_products.GFS_TP,
            "BLEND_TP": user_products.BLEND_TP,
            "QPE_15m": user_products.QPE_15m,
            "QPE_1hr": user_products.QPE_1hr,
            "QPE_PR": user_products.QPE_PR,
        }
        # Combine area and points data
        user_data = {
            "username": username,
            "county":county,
            "agency":agency,
            "user_products": user_products_data,
            "area": area_data,
            "points": points_data,
        }
        
        # Create a JSON file
        json_data = json.dumps(user_data, indent=4) 

        host = '129.82.21.71'
        port = 22
        servername = 'root'
        password = 'csu-radar'
        
        try:
            local_temp_file = f'temp_config.json'
            with open(local_temp_file, 'w') as file:
                file.write(json_data)

            remote_json_file_path = BASE_DIR + f'{username}/config.json'
            remote_base_directory = BASE_DIR + f'{username}/Download'
        
            #Ensure you install the complete suite of Putty which includes plink and pscp.
            create_dir_cmd = f'plink -P {port} -batch -pw {password} {servername}@{host} "mkdir -p {remote_base_directory}"'
            subprocess.run(create_dir_cmd, shell=True, check=True)

            scp_cmd = f'pscp -P {port} -batch -pw {password} {local_temp_file} {servername}@{host}:{remote_json_file_path}'
            subprocess.run(scp_cmd, shell=True, check=True)

            os.remove(local_temp_file)


        except Exception as e:
            error_message = f"An error occurred while trying to write the data in json file: {e}"
            logger.error(f"User:{request.user.username} - {error_message} - 500 Internal Server Error")
            return Response(error_message, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        logger.info(f"User:{request.user.username} - Data has been exported to {remote_json_file_path}")
        return HttpResponse(f"Data for {username} has been exported to {remote_json_file_path}")

class ListUserFilesView(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]
    def get(self, request):
        username = request.user.username
        # Define the directory path based on the username
        # base_directory = 'Server\server\input'
        # user_directory = os.path.join(base_directory, username)
        
        # if not os.path.exists(user_directory):
        #     return JsonResponse({"error": "No Files Found"}, status=404)
        
        # List all files in the directory
        # try:
        #     files = os.listdir(user_directory)
        # except Exception as e:
        #     return JsonResponse({"error": str(e)}, status=500)
        # file_urls = []
        # print("FILES -------",files)
        # try:
        #     for file_name in files:
        #         secure_download_url = generateDownloadLink(username,file_name)
        #         file_urls.append({
        #             "filename": file_name,
        #             "url": secure_download_url
        #         })
        # except Exception as e:
            # return Response(f"An error occurred while trying to generate the download link"+"\n", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        host = '129.82.21.71'
        port = 22
        username_ssh = 'root'
        password_ssh = 'csu-radar'
        remote_base_directory = BASE_DIR + f'{username}/Download'
        try:
            list_files_cmd = f'plink -P {port} -batch -pw {password_ssh} {username_ssh}@{host} "ls {remote_base_directory}"'
            result = subprocess.run(list_files_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
            
            if result.returncode != 0:
                error_message = result.stderr.decode('utf-8').strip()
                return JsonResponse({"error": error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            files = result.stdout.decode('utf-8').strip().split('\n')

            file_urls = []
            if not files or files[0] == '':
                return JsonResponse({"files": file_urls, "message": "No files found."})
            
            for file_name in files:
                secure_download_url = generateDownloadLink(username, file_name)
                file_urls.append({
                    "filename": file_name,
                    "url": secure_download_url
                })

        except Exception as e:
            logger.error(f"User:{request.user.username} - {str(e)} - 500 Internal Server Error")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        

        return JsonResponse({"files": file_urls})
    

###################################### AREA AND POINTS REQUEST ######################################
    
class AreaAndPointUpdateView(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        area_data = request.data.get('area', {})
        points_data = request.data.get('points', [])

        if not username:
            logger.error(f"User:{request.user.username} - Username required in request - 400 Bad Request")
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_instance = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            logger.error(f"User:{request.user.username} - 404 User Not Found")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if 'coord' in area_data:
            area_coord = area_data.get('coord', [])
            if area_coord:
                try:
                    area_instance = Area_model.objects.get(username=user_instance)
                    area_serializer = AreaSerializer(area_instance, data={'coord': area_coord}, context={'user_instance': user_instance})
                except Area_model.DoesNotExist:
                    area_serializer = AreaSerializer(data={'coord': area_coord}, context={'user_instance': user_instance})

                if area_serializer.is_valid():
                    area_serializer.save()
                else:
                    return Response(area_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                Area_model.objects.filter(username=user_instance).delete()
        else:
            Area_model.objects.filter(username=user_instance).delete()
        
        # Handle Points data
        try:
            Point_model.objects.filter(username=user_instance).delete()
            for point_name,point_data in points_data.items():
                coord = point_data.get('coord', [])
                point_serializer = PointSerializer(data={'coord': coord, 'point_name': point_name,'username': user_instance})
                if point_serializer.is_valid():
                    point_serializer.save()
                else:
                    logger.error(f"User:{request.user.username} - 400 Bad Request")
                    return Response(point_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred while updating points: {str(e)} - 500 Internal Server Error")
            return Response(f"An error occurred while updating points: {str(e)}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            export_view = ExportUserDataView()
            response = export_view.get(request)
        except Exception as e:
            logger.error(f"User:{request.user.username} - An error occurred while trying to save the changes in json file - 500 Internal Server Error")
            return Response(f"An error occurred while trying to save the changes in json file"+"\n"+response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        logger.info(f"User:{request.user.username} - Area and Points updated Successfully")
        return Response({"message": "Area and points updated successfully"}, status=status.HTTP_200_OK)


class AreaAndPointRetrieveView(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]
 
    def get(self, request, *args, **kwargs):
        username = request.user.username
 
        if not username:
            logger.error(f"User:{request.user.username} - Username required in request - 400 Bad request")
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
 
        try:
            area_instance = Area_model.objects.get(username=username)
            isAreaExist = True
            area_coord = [
                area_instance.point1_x, area_instance.point1_y,
                area_instance.point2_x, area_instance.point2_y
                # area_instance.point3_x, area_instance.point3_y,
                # area_instance.point4_x, area_instance.point4_y
            ]
        except Area_model.DoesNotExist:
            isAreaExist = False
            area_coord = []
        try:
            points_queryset = Point_model.objects.filter(username=username)
            isPointsExist = points_queryset.exists()
            points_count = points_queryset.count()
            points_data = [{"coord": [point.point_x, point.point_y, point.point_x, point.point_y]} for point in points_queryset]
        except Point_model.DoesNotExist:
            points_count=0
            isPointsExist=False
            points_data=[]
 
        return Response({
            "username": username,
            "isAreaExist": isAreaExist,
            "isPointsExist": isPointsExist,
            "points_count": points_count,
            "area": {
                "coord": area_coord
            },
            "points": points_data
        }, status=status.HTTP_200_OK)
    

    from django.http import HttpResponse

def generateDownloadLink(userid, filename):
    signer = TimestampSigner()
    token = signer.sign(f"{userid}/{filename}")
    #download_link = f"/api/products/download/{userid}/{filename}/?token={token}"
    download_link = f"/api/products/downloadapi/{userid}/{filename}/?token={token}"
    return download_link

def secure_download(request, userid, filename):
    token = request.GET.get('token')
    signer = TimestampSigner()

    try:
        signed_value = signer.unsign(token, max_age=600)  # Token is valid for 10 minutes
        if signed_value != f"{userid}/{filename}":
            raise BadSignature("Invalid token")

        # SSH connection parameters
        host = '129.82.21.71'
        port = 22  
        username = 'root'
        password = 'csu-radar'
        remote_file_path = BASE_DIR + f'{userid}/zipfile/{filename}'
        local_temp_file = f'{filename}'

        try:
            
            download_cmd = f'pscp -P {port} -batch -pw {password} {username}@{host}:{remote_file_path} {local_temp_file}'
            subprocess.run(download_cmd, shell=True, check=True)

            with open(local_temp_file, 'rb') as file:
                file_data = file.read()

            response = HttpResponse(file_data, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            os.remove(local_temp_file)

            return response
        
        except Exception as e:
            logger.error(f"User:{request.user.username} - {e}")
            return HttpResponse(f"Error: {e}")

    except (BadSignature, SignatureExpired) as e:
        logger.error(f"User:{request.user.username} - Invalid or Expired Token")
        return Http404("Invalid or expired token")
    

class SecureDownloadAPI(APIView):
    permission_classes = [IsAuthenticated,IsTokenValid]

    def get(self, request, userid, filename):
        token = request.GET.get('token')
        signer = TimestampSigner()

        local_temp_file = f'{filename}'
        try:
            signed_value = signer.unsign(token, max_age=600)  # Token is valid for 10 minutes
            if signed_value != f"{userid}/{filename}":
                raise BadSignature("Invalid token")

            # SSH connection parameters
            host = '129.82.21.71'
            port = 22  
            username = 'root'
            password = 'csu-radar'
            remote_file_path = BASE_DIR + f'{userid}/Download/{filename}' 
            zipfile_path = BASE_DIR + f'{userid}/zipfile/{filename}' 
            local_temp_file = f'{filename}'
            file_type = 0

            try:
                download_cmd = f'pscp -P {port} -batch -pw {password} {username}@{host}:{remote_file_path} {local_temp_file}' 
                subprocess.run(download_cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
              
            except Exception as e:
                try:
                    file_type = 1
                    download_cmd = f'pscp -P {port} -batch -pw {password} {username}@{host}:{zipfile_path} {local_temp_file}'
                    subprocess.run(download_cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                except Exception as e:
                    # If the file is not found in both locations, return a 404 error
                    return HttpResponse("File not found", status=404)

            with open(local_temp_file, 'rb') as file:
                file_data = file.read()

            

            if file_type == 1:
                content_type = 'application/zip'
            else:
                content_type = 'application/octet-stream'

            response = HttpResponse(file_data, content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            return response

        except (BadSignature, SignatureExpired) as e:
            logger.error(f"User:{request.user.username} - Invalid or Expired Token")
            return HttpResponse(f"Invalid or Expired Token", status=404)
        
        except Exception as e:
            logger.error(f"User:{request.user.username} - {e}")
            return HttpResponse(f"Error: {e}", status=500)
        
        finally:
            # Added cleanup to ensure the temporary file is removed
            if os.path.exists(local_temp_file):
                os.remove(local_temp_file)        


class DownloadZipFileScriptAPI(APIView):
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return JsonResponse({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate user
        user = authenticate(request, username=username, password=password)
        if user is None:
            logger.error(f"Invalid credentials for user: {username}")
            return JsonResponse({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        host = '129.82.21.71'
        port = 22
        ssh_username = 'root'
        ssh_password = 'csu-radar'
        remote_base_directory = BASE_DIR + f'{username}/Download'
        local_temp_dir = 'Server'
        zip_filename = f'{username}_files.zip'
        local_zip_path = os.path.join(local_temp_dir, zip_filename)
        zipfile_path = BASE_DIR + f'{username}/zipfile'

        check_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "test -d {zipfile_path}"'
        check_folder = subprocess.run(check_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if check_folder.returncode != 0:
            create_dir_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "mkdir -p {zipfile_path}"'
            subprocess.run(create_dir_cmd, shell=True, check=True)

        # Remove existing zip file on remote server if exists
        try:
            remote_zip_path = f'{zipfile_path}/{zip_filename}'
            remove_zip_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "rm -f {remote_zip_path}"'
            subprocess.run(remove_zip_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
        except Exception as e:
            logger.error(f"Error while removing existing zip file on remote server: {str(e)}")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Create a new zip file locally
        try:
            if os.path.exists(local_zip_path):
                os.remove(local_zip_path)

            list_files_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "ls {remote_base_directory}"'
            result = subprocess.run(list_files_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if result.returncode != 0:
                error_message = result.stderr.decode('utf-8').strip()
                logger.error(f"Failed to list files: {error_message}")
                return JsonResponse({"error": "Failed to list files from the remote server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            files = result.stdout.decode('utf-8').strip().split('\n')
            if not files or files[0] == '':
                return JsonResponse({"files": [], "message": "No files found."})

            with zipfile.ZipFile(local_zip_path, 'w') as zipf:
                for file_name in files:
                    remote_file_path = f'{remote_base_directory}/{file_name}'
                    local_temp_file = os.path.join(local_temp_dir, file_name)
                    download_cmd = f'pscp -P {port} -batch -pw {ssh_password} {ssh_username}@{host}:{remote_file_path} {local_temp_file}'
                    result = subprocess.run(download_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    if result.returncode != 0:
                        error_message = result.stderr.decode('utf-8').strip()
                        logger.error(f"Failed to download {remote_file_path}: {error_message}")
                        continue

                    zipf.write(local_temp_file, file_name)
                    os.remove(local_temp_file)

        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return JsonResponse({"error": "An error occurred during the zip file creation."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Upload the zip file to the remote server
        try:
            upload_cmd = f'pscp -P {port} -batch -pw {ssh_password} {local_zip_path} {ssh_username}@{host}:{zipfile_path}'
            result = subprocess.run(upload_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if result.returncode != 0:
                error_message = result.stderr.decode('utf-8').strip()
                logger.error(f"Failed to upload zip file to remote server: {error_message}")
                return JsonResponse({"error": "Failed to upload zip file to the remote server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error occurred while uploading zip file to remote server: {str(e)}")
            return JsonResponse({"error": "An error occurred while uploading the zip file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Clean up local zip file
        if os.path.exists(local_zip_path):
            os.remove(local_zip_path)

        # move_file_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "mv {remote_base_directory}/{zip_filename} {zipfile_path}"'
        # result = subprocess.run(move_file_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        # if result.returncode != 0:
        #     error_message = result.stderr.decode('utf-8').strip()
        #     logger.error(f"Failed to move file: {error_message}")

        # current_zip_path = f'{remote_base_directory}/{zip_filename}'
        # remove_cuurent_zip_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "rm -f {current_zip_path}"'
        # subprocess.run(remove_cuurent_zip_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


        signer = TimestampSigner()
        token = signer.sign(f"{username}/{zip_filename}")
        download_link = f"/api/products/download/{username}/{zip_filename}/?token={token}"
        #download_link = f"/api/products/downloadapi/{username}/{zip_filename}/?token={token}"
        return JsonResponse({"download_url": download_link})
    

class DownloadZipFileAPI(APIView):
    permission_classes = [IsAuthenticated, IsTokenValid]

    def get(self, request):
        username = request.user.username
        host = '129.82.21.71'
        port = 22
        ssh_username = 'root'
        ssh_password = 'csu-radar'
        remote_base_directory = BASE_DIR + f'{username}/Download'
        zipfile_path = BASE_DIR + f'{username}/zipfile'
        zip_filename = f'{username}_files.zip'
        remote_zip_path = f'{zipfile_path}/{zip_filename}'
        local_temp_dir = 'Server'
        local_zip_path = os.path.join(local_temp_dir, zip_filename)


        check_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "test -d {zipfile_path}"'
        check_folder = subprocess.run(check_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if check_folder.returncode != 0:
            create_dir_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "mkdir -p {zipfile_path}"'
            subprocess.run(create_dir_cmd, shell=True, check=True)

        # Remove existing zip file on remote server
        try:
            remove_zip_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "rm -f {remote_zip_path}"'
            subprocess.run(remove_zip_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except Exception as e:
            logger.error(f"Error while removing existing zip file on remote server: {str(e)}")
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Create a new zip file locally
        try:
            if os.path.exists(local_zip_path):
                os.remove(local_zip_path)

            list_files_cmd = f'plink -P {port} -batch -pw {ssh_password} {ssh_username}@{host} "ls {remote_base_directory}"'
            result = subprocess.run(list_files_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if result.returncode != 0:
                error_message = result.stderr.decode('utf-8').strip()
                logger.error(f"Failed to list files: {error_message}")
                return JsonResponse({"error": "Failed to list files from the remote server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            files = result.stdout.decode('utf-8').strip().split('\n')
            if not files or files[0] == '':
                return JsonResponse({"files": [], "message": "No files found."})

            with zipfile.ZipFile(local_zip_path, 'w') as zipf:
                for file_name in files:
                    remote_file_path = f'{remote_base_directory}/{file_name}'
                    local_temp_file = os.path.join(local_temp_dir, file_name)
                    download_cmd = f'pscp -P {port} -batch -pw {ssh_password} {ssh_username}@{host}:{remote_file_path} {local_temp_file}'
                    result = subprocess.run(download_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    if result.returncode != 0:
                        error_message = result.stderr.decode('utf-8').strip()
                        logger.error(f"Failed to download {remote_file_path}: {error_message}")
                        continue

                    zipf.write(local_temp_file, file_name)
                    os.remove(local_temp_file)

        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return JsonResponse({"error": "An error occurred during the zip file creation."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Upload the zip file to the remote server
        try:
            upload_cmd = f'pscp -P {port} -batch -pw {ssh_password} {local_zip_path} {ssh_username}@{host}:{zipfile_path}'
            result = subprocess.run(upload_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if result.returncode != 0:
                error_message = result.stderr.decode('utf-8').strip()
                logger.error(f"Failed to upload zip file to remote server: {error_message}")
                return JsonResponse({"error": "Failed to upload zip file to the remote server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error occurred while uploading zip file to remote server: {str(e)}")
            return JsonResponse({"error": "An error occurred while uploading the zip file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Clean up local zip file
        if os.path.exists(local_zip_path):
            os.remove(local_zip_path)

        signer = TimestampSigner()
        token = signer.sign(f"{username}/{zip_filename}")
        download_link = f"/api/products/downloadapi/{username}/{zip_filename}/?token={token}"
        return JsonResponse({"download_url": download_link})
    

class GetUserProductsView(APIView):
    permission_classes = [IsAuthenticated, IsTokenValid]

    def get(self, request):
        username = request.user.username
        print(username)
        try:
            user_products = UserProducts.objects.get(username=username)
            user_products_data = {
                "HRRR_TP": user_products.HRRR_TP,
                "HRRR_PR": user_products.HRRR_PR,
                "HRRR15_PR": user_products.HRRR15_PR,
                "GFS_TP": user_products.GFS_TP,
                "BLEND_TP": user_products.BLEND_TP,
                "QPE_15m": user_products.QPE_15m,
                "QPE_1hr": user_products.QPE_1hr,
                "QPE_PR": user_products.QPE_PR,
            }
            return Response(user_products_data, status=status.HTTP_200_OK)
        except UserProducts.DoesNotExist:
            return Response({"error": "User products not found"}, status=status.HTTP_404_NOT_FOUND)
        

class UpdateUserProductsView(APIView):
    permission_classes = [IsAuthenticated, IsTokenValid]

    def post(self, request):
        username = request.user.username
        product_data = request.data
        print(username)

        try:
            user_products = UserProducts.objects.get(username=username)
            user_products.HRRR_TP = product_data.get("HRRR_TP", user_products.HRRR_TP)
            user_products.HRRR_PR = product_data.get("HRRR_PR", user_products.HRRR_PR)
            user_products.HRRR15_PR = product_data.get("HRRR15_PR", user_products.HRRR15_PR)
            user_products.GFS_TP = product_data.get("GFS_TP", user_products.GFS_TP)
            user_products.BLEND_TP = product_data.get("BLEND_TP", user_products.BLEND_TP)
            user_products.QPE_15m = product_data.get("QPE_15m", user_products.QPE_15m)
            user_products.QPE_1hr = product_data.get("QPE_1hr", user_products.QPE_1hr)
            user_products.QPE_PR = product_data.get("QPE_PR", user_products.QPE_PR)
            user_products.save()

            area_exists = Area_model.objects.filter(username=username).exists()
            point_exists = Point_model.objects.filter(username=username).exists()

            if area_exists or point_exists:
                self.create_config_json(username)

            return Response({"message": "User products updated successfully"}, status=status.HTTP_200_OK)
        except UserProducts.DoesNotExist:
            return Response({"error": "User products not found"}, status=status.HTTP_404_NOT_FOUND)

    def create_config_json(self, username):
        try:
            area = Area_model.objects.get(username=username)
            area_data = {
                "P1": {"lat": area.point1_y, "lon": area.point1_x},
                "P2": {"lat": area.point2_y, "lon": area.point2_x},
                "P3": {"lat": area.point3_y, "lon": area.point3_x},
                "P4": {"lat": area.point4_y, "lon": area.point4_x}
            }
        except Area_model.DoesNotExist:
            area_data = None

        try:
            points = Point_model.objects.filter(username=username)
            points_data = {
                point.point_name: {
                    "lat": point.point_y,
                    "lon": point.point_x,
                }
                for point in points
            }
        except Point_model.DoesNotExist:
            points_data = {}

        try:
            user_details = CustomUser.objects.get(username=username)
            county = user_details.county
            agency = user_details.agency
        except CustomUser.DoesNotExist:
            county = None
            agency = None

        try:
            user_products = UserProducts.objects.get(username=username)
            user_products_data = {
                "HRRR_TP": user_products.HRRR_TP,
                "HRRR_PR": user_products.HRRR_PR,
                "HRRR15_PR": user_products.HRRR15_PR,
                "GFS_TP": user_products.GFS_TP,
                "BLEND_TP": user_products.BLEND_TP,
                "QPE_15m": user_products.QPE_15m,
                "QPE_1hr": user_products.QPE_1hr,
                "QPE_PR": user_products.QPE_PR,
            }
        except UserProducts.DoesNotExist:
            user_products_data = {
                "HRRR_TP": False,
                "HRRR_PR": False,
                "HRRR15_PR": False,
                "GFS_TP": False,
                "BLEND_TP": False,
                "QPE_15m": False,
                "QPE_1hr": False,
                "QPE_PR": False,
            }

        user_data = {
            "username": username,
            "county": county,
            "agency": agency,
            "area": area_data,
            "points": points_data,
            "user_products": user_products_data,
        }

        json_data = json.dumps(user_data, indent=4)

        host = '129.82.21.71'
        port = 22
        servername = 'root'
        password = 'csu-radar'

        try:
            local_temp_file = 'temp_config.json'
            with open(local_temp_file, 'w') as file:
                file.write(json_data)

            remote_json_file_path = BASE_DIR + f'{username}/config.json'
            remote_base_directory = BASE_DIR + f'{username}/Download'

            create_dir_cmd = f'plink -P {port} -batch -pw {password} {servername}@{host} "mkdir -p {remote_base_directory}"'
            subprocess.run(create_dir_cmd, shell=True, check=True)

            scp_cmd = f'pscp -P {port} -batch -pw {password} {local_temp_file} {servername}@{host}:{remote_json_file_path}'
            subprocess.run(scp_cmd, shell=True, check=True)

        except Exception as e:
            logger.error(f"User:{username} - An error occurred while creating the config.json file: {e}")
        finally:
            if os.path.exists(local_temp_file):
                os.remove(local_temp_file)