from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.views.decorators.csrf import csrf_exempt
import logging
import json

from .populate import initiate
from .models import CarMake, CarModel
from .restapis import (
    get_request,
    analyze_review_sentiments,
    post_review,
)

# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

# Create a `login_user` view to handle sign in request
@csrf_exempt
def login_user(request):
    # Expect JSON body with userName and password
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]

    # Try to authenticate user
    user = authenticate(username=username, password=password)
    if user is not None:
        # If user is valid, log them in
        login(request, user)
        response_data = {"userName": username, "status": "Authenticated"}
    else:
        response_data = {"userName": username, "status": "Failed"}

    return JsonResponse(response_data)


# Create a `logout_user` view to handle sign out request
@csrf_exempt
def logout_user(request):
    # Terminate user session
    logout(request)
    # Return empty username
    data = {"userName": ""}
    return JsonResponse(data)


# Create a `registration` view to handle sign up request
@csrf_exempt
def registration(request):
    # Load JSON data from the request body
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]
    first_name = data["firstName"]
    last_name = data["lastName"]
    email = data["email"]
    username_exist = False

    try:
        # Check if user already exists
        User.objects.get(username=username)
        username_exist = True
    except Exception as exc:
        # If not, simply log this is a new user
        logger.debug("%s is new user. %s", username, exc)

    # If it is a new user
    if not username_exist:
        # Create user in auth_user table
        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
            email=email,
        )
        # Login the user and redirect to list page
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
        return JsonResponse(data)

    data = {"userName": username, "error": "Already Registered"}
    return JsonResponse(data)


# New view: get_cars
def get_cars(request):
    count = CarMake.objects.count()
    if count == 0:
        initiate()

    car_models = CarModel.objects.select_related("car_make")
    cars = []
    for car_model in car_models:
        cars.append(
            {
                "CarModel": car_model.name,
                "CarMake": car_model.car_make.name,
            }
        )
    return JsonResponse({"CarModels": cars})


# Update the `get_dealerships` view:
# list all dealerships by default, or filter by state if provided.
def get_dealerships(request, state="All"):
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/" + state

    dealerships = get_request(endpoint)
    return JsonResponse(
        {
            "status": 200,
            "dealers": dealerships,
        }
    )


def get_dealer_reviews(request, dealer_id):
    # if dealer id has been provided
    if not dealer_id:
        return JsonResponse({"status": 400, "message": "Bad Request"})

    endpoint = "/fetchReviews/dealer/" + str(dealer_id)
    reviews = get_request(endpoint) or []  # if get_request returns None

    for review_detail in reviews:
        try:
            sentiment = analyze_review_sentiments(
                review_detail.get("review", "")
            )
        except Exception as exc:
            logger.exception(
                "Sentiment analysis failed for review %s. %s",
                review_detail,
                exc,
            )
            sentiment = "neutral"

        review_detail["sentiment"] = sentiment or "neutral"

    return JsonResponse(
        {
            "status": 200,
            "reviews": reviews,
        }
    )


def get_dealer_details(request, dealer_id):
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse(
            {
                "status": 200,
                "dealer": dealership,
            }
        )

    return JsonResponse({"status": 400, "message": "Bad Request"})


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse(
            {"status": 405, "message": "Method not allowed"}
        )

    if request.user.is_anonymous:
        return JsonResponse(
            {"status": 403, "message": "Unauthorized"}
        )

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"status": 400, "message": "Invalid JSON body"}
        )

    try:
        # send data to your Cloud Function / backend
        post_review(data)
        return JsonResponse({"status": 200})
    except Exception as exc:
        logger.exception("Error in posting review: %s", exc)
        return JsonResponse(
            {
                "status": 500,
                "message": "Error in posting review",
            }
        )
