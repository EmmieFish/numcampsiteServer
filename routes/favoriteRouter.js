const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .populate("user")
            .populate("campsites")
            .then((favorite) => {
                if (!favorite) {
                    console.log("No favorites found");
                    res.statusCode = 200;
                    // res.statusCode = 404; can also work maybe
                    res.setHeader("Content-Type", "application/json");
                    res.end("No faves found");
                }
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    req.body.forEach((campsite) => {
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite._id);
                            favorite
                                .save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader(
                                        "Content-Type",
                                        "application/json"
                                    );
                                    res.json(favorite);
                                })
                                .catch((err) => next(err));
                        } else {
                            console.log("Already in favorites");
                        }
                    });
                } else {
                    console.log("Favorite not Found");
                    Favorite.create({ user: req.user._id })
                        .then((favorite) => {
                            req.body.forEach((campsite) => {
                                favorite.campsites.push(campsite._id);
                                favorite.save();
                                console.log("Favorite Created:", favorite);
                                res.statusCode = 200;
                                res.setHeader(
                                    "Content-Type",
                                    "application/json"
                                );
                                res.json(favorite);
                            });
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((response) => {
                if (response) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(`Deleted Favorite Campsite`)

                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("You do not have any favorites to delete");
                }
            })
            .catch((err) => next(err));
    });

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("GET operation not supported on /favorites/:campsiteI");
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite
                            .save()
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader(
                                    "Content-Type",
                                    "application/json"
                                );
                                res.json(favorite);
                            })
                            .catch((err) => next(err));
                    } else {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.end(
                            "That campsite is already in the list of favorites!"
                        );
                    }
                } else {
                    console.log("Favorite not Found");
                    Favorite.create({ user: req.user._id })
                        .then((favorite) => {
                            console.log("Favorite Created:", favorite);
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites/:campsiteId");
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorites) => {
                const idx = favorites.campsites.indexOf(req.params.campsiteId);
                if (idx != -1) {
                    favorites.campsites.splice(idx, 1)
                    favorites.save()
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json("Successfully deleted!");
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end("There are no favorites to delete!");
                }
            })
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;
