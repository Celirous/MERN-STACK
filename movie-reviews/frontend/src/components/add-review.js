import React, { useState } from "react";
import MovieDataService from "../services/movies";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const AddReview = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're editing an existing review
  const currentReview = location.state?.currentReview;
  let editing = currentReview ? true : false;
  let initialReviewState = editing ? currentReview.review : "";

  const [review, setReview] = useState(initialReviewState);
  const [submitted, setSubmitted] = useState(false);

  const onChangeReview = (e) => {
    setReview(e.target.value);
  };

  const saveReview = () => {
    var data = {
      review: review,
      name: props.user.name,
      user_id: props.user.id,
      movie_id: id,
    };

    if (editing) {
      data.review_id = currentReview._id;
      MovieDataService.updateReview(data)
        .then(() => setSubmitted(true))
        .catch((e) => console.log(e));
    } else {
      MovieDataService.createReview(data)
        .then(() => setSubmitted(true))
        .catch((e) => console.log(e));
    }
  };

  return (
    <div>
      {submitted ? (
        <div>
          <h4>Review {editing ? "updated" : "submitted"} successfully</h4>
          <Link to={"/movies/" + id}>Back to Movie</Link>
        </div>
      ) : (
        <Form>
          <Form.Group>
            <Form.Label>{editing ? "Edit" : "Create"} Review</Form.Label>
            <Form.Control
              type="text"
              required
              value={review}
              onChange={onChangeReview}
            />
          </Form.Group>
          <Button variant="primary" onClick={saveReview}>
            Submit
          </Button>
        </Form>
      )}
    </div>
  );
};

export default AddReview;