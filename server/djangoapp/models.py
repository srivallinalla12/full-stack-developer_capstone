# Uncomment the following imports before adding the Model code

from django.db import models
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator


# Create your models here.

# Car Make model
class CarMake(models.Model):
    # Basic fields
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    # Optional extra field(s)
    country = models.CharField(max_length=100, blank=True)

    def __str__(self):
        # This is what will be shown in admin / shell
        return self.name


# Car Model model
class CarModel(models.Model):
    # Choices for car type
    SEDAN = 'SEDAN'
    SUV = 'SUV'
    WAGON = 'WAGON'
    COUPE = 'COUPE'
    TRUCK = 'TRUCK'

    CAR_TYPES = [
        (SEDAN, 'Sedan'),
        (SUV, 'SUV'),
        (WAGON, 'Wagon'),
        (COUPE, 'Coupe'),
        (TRUCK, 'Truck'),
    ]

    # Many-to-one relation to CarMake
    car_make = models.ForeignKey(
        CarMake,
        on_delete=models.CASCADE,
        related_name='models'
    )

    # Dealer Id from Cloudant
    dealer_id = models.IntegerField()

    # Basic fields
    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=10,
        choices=CAR_TYPES,
        default=SEDAN
    )
    year = models.IntegerField(
        validators=[
            MinValueValidator(2015),
            MaxValueValidator(2023),
        ]
    )

    # Optional extra field(s)
    created_at = models.DateTimeField(default=now, editable=False)

    def __str__(self):
        # Print car make + model, e.g. "Toyota Corolla"
        return f"{self.car_make.name} {self.name}"
