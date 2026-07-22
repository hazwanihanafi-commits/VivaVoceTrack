import express from "express";

import {

    getVivaCases,

    getVivaCase,

    createVivaCase

} from "../controllers/vivaCaseController.js";

const router = express.Router();

router.get("/", getVivaCases);

router.get("/:id", getVivaCase);

router.post("/", createVivaCase);

export default router;
