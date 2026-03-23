from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

#Custom User Logic - 
class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    agency = models.CharField(max_length=255, null=True, blank=True)
    county = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=255, null=True, blank=True)
    isActive = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username
    
class Area_model(models.Model):
    point1_x = models.FloatField()
    point1_y = models.FloatField()
    point2_x = models.FloatField()
    point2_y = models.FloatField()
    point3_x = models.FloatField()
    point3_y = models.FloatField()
    point4_x = models.FloatField()
    point4_y = models.FloatField()
    username = models.ForeignKey(CustomUser, on_delete=models.CASCADE, to_field='username', related_name='areas')

    def __str__(self):
        return f"Points({self.point1_x}, {self.point1_y}), ({self.point2_x}, {self.point2_y}), ({self.point3_x}, {self.point3_y}), ({self.point4_x}, {self.point4_y}), Username({self.username})"
    
class Point_model(models.Model):
    point_x = models.FloatField()
    point_y = models.FloatField()
    point_name = models.CharField(max_length=10)
    username = models.ForeignKey(CustomUser, on_delete=models.CASCADE, to_field='username', related_name='points')

    def __str__(self):
        return f"Point({self.point_x}, {self.point_y}) named {self.point_name} for Area({self.area.username})"
    
class UserProducts(models.Model):
    username = models.ForeignKey(CustomUser, on_delete=models.CASCADE, to_field='username', related_name='username_products')
    HRRR_TP = models.BooleanField(default=True)
    HRRR_PR = models.BooleanField(default=True)
    HRRR15_PR = models.BooleanField(default=True)
    GFS_TP = models.BooleanField(default=True)
    BLEND_TP = models.BooleanField(default=True)
    QPE_15m = models.BooleanField(default=True)
    QPE_1hr = models.BooleanField(default=True)
    QPE_PR = models.BooleanField(default=True)

    def __str__(self):
        return f"UserProducts for {self.user.username}"