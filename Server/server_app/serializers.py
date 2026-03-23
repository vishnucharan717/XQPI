from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .models import Area_model, Point_model, CustomUser
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache

User = get_user_model()

################################# LOGIN and REGISTRATION #################################
class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password','password2','agency', 'county', 'role', 'isActive']
        extra_kwargs = {
            'password': {'write_only': True},
            'password2': {'write_only': True},
            'isActive': {'required':False},
                    }

    def validate(self,data):
        if data['password']!=data['password2']:
            raise serializers.ValidationError("Passwords Do not match")
        if 'username' not in data:
            raise serializers.ValidationError({"username": "This field is required."})
        if 'email' not in data:
            raise serializers.ValidationError({"email": "This field is required."})
        if 'password' not in data:
            raise serializers.ValidationError({"password": "This field is required."})
        if 'password2' not in data:
            raise serializers.ValidationError({"password2": "This field is required."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'], 
            email=validated_data['email'], 
            password=validated_data['password'],
            agency=validated_data.get('agency'),
            county=validated_data.get('county'),
            role=validated_data.get('role'),
            isActive=validated_data.get('isActive', True)
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','username', 'email', 'agency', 'county', 'role', 'isActive']

class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','county','agency','role', 'isActive','password']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def update(self, instance, validated_data):
        instance.username =  validated_data.get('username', instance.username)
        instance.email =  validated_data.get('email', instance.email)
        instance.county = validated_data.get('county', instance.county)
        instance.agency = validated_data.get('agency', instance.agency)
        instance.role = validated_data.get('role', instance.role)
        instance.isActive = validated_data.get('isActive', instance.isActive)
        password = validated_data.get('password')
        if password:
            instance.set_password(password) 
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

######################################################################################

####################################### POINT and AREA COMBINED  ###############################################

class AreaSerializer(serializers.ModelSerializer):
    coord = serializers.ListField(child=serializers.FloatField(), write_only=True)

    class Meta:
        model = Area_model
        fields = ['coord']

    def create(self, validated_data):
        coord = validated_data.pop('coord')
        user_instance = self.context['user_instance']

        # Extract coordinates from request
        point1_x, point1_y = coord[0], coord[1]
        point2_x, point2_y = coord[2], coord[3]

        # Calculate other two points
        point3_x, point3_y = point1_x, point2_y
        point4_x, point4_y = point2_x, point1_y

        instance = Area_model.objects.create(
            point1_x=point1_x, point1_y=point1_y,
            point2_x=point2_x, point2_y=point2_y,
            point3_x=point3_x, point3_y=point3_y,
            point4_x=point4_x, point4_y=point4_y,
            username=user_instance
        )
        return instance

    def update(self, instance, validated_data):
        coord = validated_data.pop('coord', None)

        if coord:
            # Extract coordinates from request
            point1_x, point1_y = coord[0], coord[1]
            point2_x, point2_y = coord[2], coord[3]

            # Calculate other two points
            instance.point1_x = point1_x
            instance.point1_y = point1_y
            instance.point2_x = point2_x
            instance.point2_y = point2_y
            instance.point3_x = point1_x  # Assuming this logic for update
            instance.point3_y = point2_y
            instance.point4_x = point2_x
            instance.point4_y = point1_y
        instance.save()
        return instance

class PointSerializer(serializers.ModelSerializer):
    coord = serializers.ListField(child=serializers.FloatField(), write_only=True)
    point_name = serializers.CharField(max_length=10)

    class Meta:
        model = Point_model
        fields = ['coord','point_name','username']

    def create(self, validated_data):
        coord = validated_data.pop('coord')
        point_name = validated_data.pop('point_name')
        instance = Point_model.objects.create(
            point_x=coord[0],
            point_y=coord[1],
            point_name=point_name,
            username=validated_data['username']
        )
        return instance

    def update(self, instance, validated_data):
        coord = validated_data.pop('coord', None)
        point_name = validated_data.get('point_name', instance.point_name) 
        instance.username = validated_data.get('username', instance.username)
        instance.point_name = point_name
        if coord:
            instance.point_x = coord[0]
            instance.point_y = coord[1]
        instance.save()
        return instance





###################################  TOKEN ###################################################
    
class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        refresh = attrs['refresh']
        try:
            token = RefreshToken(refresh)
        except Exception:
            raise InvalidToken('Invalid refresh token')
        if cache.get(token['jti']):
            raise InvalidToken('Token is blacklisted')
        return super().validate(attrs)


######################################################################################
    

# class AreaSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Area_model
#         fields = ['point1_x', 'point1_y', 'point2_x', 'point2_y', 'point3_x', 'point3_y', 'point4_x', 'point4_y','username']

# class PointSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Point_model
#         fields = ['point_x','point_y','username']