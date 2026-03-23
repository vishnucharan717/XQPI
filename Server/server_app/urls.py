from django.urls import path
from . import views
from .views import RegisterAPI, LoginAPI, LogoutAPI, VerifyTokenAPI, AreaModelCreateView, PointModelCreateView, UserDetailView, UpdateUserView, UserDataAPIView, AreaModelUpdateView, ExportUserDataView, ListUserFilesView, AreaAndPointUpdateView, AreaAndPointRetrieveView, AllUsersView, secure_download, SecureDownloadAPI, CustomTokenRefreshView, DownloadZipFileScriptAPI, DownloadZipFileAPI, GetUserProductsView, UpdateUserProductsView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    #TOKEN
    #URL for verifying the existing token
    path('api/verify-token/', VerifyTokenAPI.as_view(), name='verify_token'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),

    #REGISTRATION
    #URL for registering a user
    path('api/register/', RegisterAPI.as_view(), name='register'),
    #URL for updating user data for a particular username
    path('api/user/update/<int:pk>/', UpdateUserView.as_view(), name='user_update'),
    #URL for viewing the details of a particular user
    path('api/user/view/', UserDetailView.as_view(), name='user_detail'),
    path('api/view/users/', AllUsersView.as_view(), name='all_users'),

    #LOGIN
    #URL for User login
    path('api/login/', LoginAPI.as_view(), name='login'),
    #URL for logout
    path('api/logout/', LogoutAPI.as_view(), name='logout'),

    #AREA DATA and POINT Data separately
    #URL for adding Area data
    path('api/add/area/', AreaModelCreateView.as_view(), name='add_area'),
    #URL for viewing the area data of a particular user
    path('api/view/area/', AreaModelCreateView.as_view(), name='view_area'),
    #URL for updating the area data of a particular user
    path('api/update/area/', AreaModelUpdateView.as_view(), name='update_area'),
    #URL for adding Point data
    path('api/add/point/', PointModelCreateView.as_view(), name='add_point'),
    #URL for viewing the point data of a particular user
    path('api/view/point/',PointModelCreateView.as_view(), name='view_points'),
    #URL for deleting a point (input - x,y and username)
    path('api/delete/point/', PointModelCreateView.as_view(), name='delete_points'),

    #COMBINED AREA and POINTS DATA
    #URL for Updating area and points obtained on the map
    path('api/update/areapoints/', AreaAndPointUpdateView.as_view(), name='update_area_and_points'),
    #URL for retrieving area and points plotted on the map
    path('api/view/areapoints/', AreaAndPointRetrieveView.as_view(), name='get_area_and_points'),

    #FILE HANDLING
    
    #API for dowloading a particular file with secure link
    path('api/products/downloadapi/<str:userid>/<str:filename>/', SecureDownloadAPI.as_view(), name='secure_download_api'),
    #URL for dowloading a particular file with secure link
    path('api/products/download/<str:userid>/<str:filename>/', secure_download, name='secure_download'),
    #URL for getting the area, point data and saving it as json file in a location
    path('api/save_json/', ExportUserDataView.as_view(), name='export_user_data'),

    #FILE VIEWING
    #URL for viewing the data (area and points) of a particular user
    path('api/view/user_data/', UserDataAPIView.as_view(), name='user_details'),
    #URL for listing all the files present in a particualr folder (Foldername = username)
    path('api/view/user_files/', ListUserFilesView.as_view(), name='list_user_files'),   

    path('api/get_zipfile_link_script/', DownloadZipFileScriptAPI.as_view(), name='get_zipfile_download_link_script'),
    path('api/get_zipfile_link/', DownloadZipFileAPI.as_view(), name='get_zipfile_download_link'),

    path('api/get_user_products/', GetUserProductsView.as_view(), name='get_user_products'),
    path('api/update_user_products/', UpdateUserProductsView.as_view(), name='update_user_products'),

]