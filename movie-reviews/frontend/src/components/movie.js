import React, { useState, useEffect } from "react";
import MovieDataService from "../services/movies";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

const Movie = (props) => {
  const { id } = useParams();
  const [movie, setMovie] = useState({
    id: null,
    title: "",
    rated: "",
    reviews: [],
  });

  const getMovie = (id) => {
    MovieDataService.get(id)
      .then((response) => {
        setMovie(response.data);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getMovie(id);
  }, [id]);

  const deleteReview = (reviewId, index) => {
    MovieDataService.deleteReview(reviewId, props.user.id)
      .then((response) => {
        setMovie((prevState) => {
          prevState.reviews.splice(index, 1);
          return { ...prevState };
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div>
      <Container>
        <Row>
          <Col>
            <Image src={movie.poster + "/100px250"} fluid />
          </Col>
          <Col>
            <Card>
              <Card.Header as="h5">{movie.title}</Card.Header>
              <Card.Body>
                <Card.Text>{movie.plot}</Card.Text>
                {props.user && (
                  <Link to={"/movies/" + id + "/review"}>Add Review</Link>
                )}
              </Card.Body>
            </Card>
            <br />
            <h2>Reviews</h2>
            <br />
            {movie.reviews.map((review, index) => {
              return (
                <Card key={index} className="mb-3">
                  <Card.Header as="h5">
                    {review.name + " reviewed on "}{" "}
                    {moment(review.date).format("Do MMMM YYYY")}
                  </Card.Header>
                  <Card.Body>
                    <Card.Text>{review.review}</Card.Text>
                    {props.user && props.user.id === review.user_id && (
                      <Row>
                        <Col>
                          <Link
                            to={"/movies/" + id + "/review"}
                            state={{ currentReview: review }}
                          >
                            Edit
                          </Link>
                        </Col>
                        <Col>
                          <Button
                            variant="link"
                            onClick={() => deleteReview(review._id, index)}
                          >
                            Delete
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Movie;
// This component displays detailed information about a single movie.
// It fetches movie data from the backend using the movie ID from the URL.
// The component shows the movie poster, title, plot, and a list of reviews.
// Logged-in users can add, edit, or delete their own reviews.