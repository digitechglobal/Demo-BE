const { createUser,
    getUserByUserId,
    getUsers,
    updateUsers,
    resetPassword,
    deleteUser,
    login,
    login2,
    refresh_token
 } = require("./user.controller");
const router = require("express").Router();
const { TokenCheckMiddleware } = require("../../auth/TokenCheckMiddleware");

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id",TokenCheckMiddleware,getUserByUserId);
//router.patch("/",updateUsers);
//router.delete("/:id",deleteUser);
router.post("/login2", login2);
router.post("/refresh_token", refresh_token);
//
//router.post("/", TokenCheckMiddleware, createUser);
//router.get("/:id",TokenCheckMiddleware,getUserByUserId);
router.patch("/",TokenCheckMiddleware,updateUsers);
router.patch("/resetpassword",TokenCheckMiddleware,resetPassword);
router.delete("/:id",TokenCheckMiddleware,deleteUser);


module.exports = router;
