import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import Header from "../Header/Header";

const Dealer = () => {
  const { id } = useParams();

  const [dealer, setDealer] = useState(null);
  const [dealerError, setDealerError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(null);

  const dealer_url = `/djangoapp/dealer/${id}`;
  const reviews_url = `/djangoapp/reviews/dealer/${id}`;
  const post_review_url = `/postreview/${id}`;

  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url, { method: "GET" });

      if (!res.ok) {
        console.error("Dealer request failed:", res.status);
        setDealerError(true);
        return;
      }

      const retobj = await res.json();
      console.log("dealer response:", retobj);

      // Accept both { dealer: [...] } and { dealer: { ... } }
      let d = retobj.dealer;
      if (Array.isArray(d)) {
        d = d[0];
      }

      if (d) {
        setDealer(d);
      } else {
        setDealerError(true);
      }
    } catch (err) {
      console.error("Error fetching dealer:", err);
      setDealerError(true);
    }
  };

  const get_reviews = async () => {
    try {
      const res = await fetch(reviews_url, { method: "GET" });

      if (!res.ok) {
        console.error("Reviews request failed:", res.status);
        setUnreviewed(true);
        return;
      }

      const retobj = await res.json();
      console.log("reviews response:", retobj);

      if (Array.isArray(retobj.reviews) && retobj.reviews.length > 0) {
        setReviews(retobj.reviews);
      } else {
        setUnreviewed(true);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setUnreviewed(true);
    }
  };

  const senti_icon = (sentiment) => {
    if (sentiment === "positive") return positive_icon;
    if (sentiment === "negative") return negative_icon;
    return neutral_icon;
  };

  useEffect(() => {
    get_dealer();
    get_reviews();

    if (sessionStorage.getItem("username")) {
      setPostReview(
        <a href={post_review_url}>
          <img
            src={review_icon}
            style={{ width: "10%", marginLeft: "10px", marginTop: "10px" }}
            alt="Post Review"
          />
        </a>
      );
    }
  }, [id]);

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>
          {dealerError
            ? "Dealer not found"
            : dealer?.full_name || "Loading dealer..."}
          {postReview}
        </h1>

        {dealer && (
          <h4 style={{ color: "grey" }}>
            {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
          </h4>
        )}
      </div>

      <div className="reviews_panel">
        {reviews.length === 0 && !unreviewed ? (
          <span>Loading Reviews....</span>
        ) : unreviewed ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review, index) => (
            <div className="review_panel" key={review.id || index}>
              <img
                src={senti_icon(review.sentiment)}
                className="emotion_icon"
                alt="Sentiment"
              />
              <div className="review">{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model}{" "}
                {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
