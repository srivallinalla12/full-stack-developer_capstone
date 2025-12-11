import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);

  // 🔥 Use absolute URLs instead of substring hacks
  const { id } = useParams();

  const dealer_url = `/djangoapp/dealer/${id}`;
  const review_url = `/djangoapp/add_review`;
  const carmodels_url = `/djangoapp/get_cars`;

  const postreview = async () => {
    let name = sessionStorage.getItem("firstname") + " " + sessionStorage.getItem("lastname");
    if (name.includes("null")) {
      name = sessionStorage.getItem("username");
    }

    if (!model || review.trim() === "" || date === "" || year === "") {
      alert("All details are mandatory");
      return;
    }

    const [make_chosen, ...rest] = model.split(" ");
    const model_chosen = rest.join(" ");

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review,
      "purchase": true,
      "purchase_date": date,
      "car_make": make_chosen,
      "car_model": model_chosen,
      "car_year": year,
    });

    console.log(jsoninput);

    const res = await fetch(review_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsoninput,
    });

    const json = await res.json();
    if (json.status === 200) {
      window.location.href = window.location.origin + "/dealer/" + id;
    }
  };

  const get_dealer = async () => {
    const res = await fetch(dealer_url, { method: "GET" });
    const retobj = await res.json();

    if (retobj.status === 200) {
      let dealerobjs = Array.from(retobj.dealer);
      if (dealerobjs.length > 0) {
        setDealer(dealerobjs[0]);
      }
    }
  };

  const get_cars = async () => {
    try {
      const res = await fetch(carmodels_url, { method: "GET" });
      const retobj = await res.json();

      console.log("Car models received from backend:", retobj);

      let carmodelsarr = Array.from(retobj.CarModels || []);
      setCarmodels(carmodelsarr);
    } catch (err) {
      console.error("Error fetching car models:", err);
    }
  };

  useEffect(() => {
    get_dealer();
    get_cars();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    postreview();
  };

  return (
    <div style={{ backgroundColor: "#f5f7fb", minHeight: "100vh" }}>
      <Header />
      <div
        style={{
          maxWidth: "720px",
          margin: "40px auto",
          padding: "32px 28px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(15, 35, 52, 0.12)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.8rem",
              color: "#0a3a6b",
              fontWeight: 700,
            }}
          >
            {dealer.full_name || "Dealer"}
          </h1>
          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#5f6b7a",
              fontSize: "0.95rem",
            }}
          >
            Share your experience with this dealership. Your review helps other
            drivers make better decisions.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Review text */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="review"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#1f2933",
              }}
            >
              Your review
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="6"
              placeholder="How was your overall experience? What went well, what could be improved?"
              style={{
                width: "100%",
                resize: "vertical",
                borderRadius: "10px",
                border: "1px solid #d1d9e6",
                padding: "10px 12px",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Purchase Date */}
          <div
            className="input_field"
            style={{ marginBottom: "16px", display: "flex", flexDirection: "column" }}
          >
            <label
              style={{
                marginBottom: "6px",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1f2933",
              }}
            >
              Purchase date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                borderRadius: "8px",
                border: "1px solid #d1d9e6",
                padding: "8px 10px",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          {/* Car Make & Model */}
          <div
            className="input_field"
            style={{ marginBottom: "16px", display: "flex", flexDirection: "column" }}
          >
            <label
              htmlFor="cars"
              style={{
                marginBottom: "6px",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1f2933",
              }}
            >
              Car make & model
            </label>
            <select
              name="cars"
              id="cars"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                borderRadius: "8px",
                border: "1px solid #d1d9e6",
                padding: "8px 10px",
                fontSize: "0.9rem",
                outline: "none",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="" disabled>
                Choose car make and model
              </option>
              {carmodels.map((carmodel, idx) => (
                <option
                  key={`${carmodel.CarMake}-${carmodel.CarModel}-${idx}`}
                  value={carmodel.CarMake + " " + carmodel.CarModel}
                >
                  {carmodel.CarMake} {carmodel.CarModel}
                </option>
              ))}
            </select>
          </div>

          {/* Car Year */}
          <div
            className="input_field"
            style={{ marginBottom: "24px", display: "flex", flexDirection: "column" }}
          >
            <label
              style={{
                marginBottom: "6px",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#1f2933",
              }}
            >
              Car year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              max={2025}
              min={2010}
              placeholder="e.g. 2021"
              style={{
                borderRadius: "8px",
                border: "1px solid #d1d9e6",
                padding: "8px 10px",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          {/* Submit button */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "8px",
            }}
          >
            <button
              type="submit"
              className="postreview"
              style={{
                padding: "10px 22px",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(135deg, #1456cc, #0a3a6b)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(20, 86, 204, 0.35)",
                transition: "transform 0.08s ease, box-shadow 0.08s ease",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(1px) scale(0.99)";
                e.currentTarget.style.boxShadow = "0 3px 10px rgba(20, 86, 204, 0.3)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(20, 86, 204, 0.35)";
              }}
            >
              Post review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostReview;
