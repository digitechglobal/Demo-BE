const { create, 
        getUserByUserId,
        getUsers,
        updateUser,
        deleteUser,
        getUserByUserEmail
    } = require("./user.service");

const { genSaltSync, hashSync, compareSync } = require("bcrypt");

const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

//login2_refreshtoken
const config = require('../../auth/config');
const utils = require('../../auth/utils');
const { use } = require("./user.router");
const tokenList = {};
//

module.exports = {
    createUser: (req, res) => {
        const body = req.body;
        //check rong
        if(body.email == "")
            return res.json({
                success: 0,
                message: "Email required"
            })
        if(body.firstName == "")
            return res.json({
                success: 0,
                message: "FirstName required"
            })
        if(body.password == "")
            return res.json({
                success: 0,
                message: "Password required"
            })
        //check trung email
        getUserByUserEmail(body.email,(err,results) => {
            if(err){
                console.log(err);
                return;
            }
            if(results){
                console.log(results);
                return res.json({
                    success: -1,
                    message: "Email Existence. Please enter another email."
                });
            }else{
                const salt = genSaltSync(10);
                body.password = hashSync(body.password, salt);
                create(body, (err, results) => {
                    if(err){
                        console.log(err);
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection error"
                        });
                    }
                    return res.status(200).json({
                        success: 1,
                        data: results
                    });
                });
            }
        })
        //
        
    },
    getUserByUserId: (req,res) => {
        const id = req.params.id;
        getUserByUserId(id,(err, results) => {
            if(err){
                console.log(err);
                return;
            }
            if(!results){
                return res.json({
                    success: 0,
                    message: "Record not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    getUsers: (req,res) => {
        getUsers((err, results) => {
            if(err){
                console.log(err);
                return;
            }
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    updateUsers: (req,res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        updateUser(body,(err, results) => {
            if(err){
                console.log(err);
                return;
            }
            if(!results){
                return res.json({
                    success: 0,
                    message: "Failed to update user"
                });
            }
            return res.json({
                success: 1,
                message: "updated successfully"
            });
        });
    },
    deleteUser: (req,res) => {
        const id = req.params.id;
        deleteUser(id,(err, results) => {
            if(err){
                console.log(err);
                return;
            }
            console.log(results)
            if(results['affectedRows'] == 0){
                return res.json({
                    success: 0,
                    message: "Record not Found"
                });
            }
            return res.json({
                success: 1,
                message: "User deleted successfully"
            })
        });
    },
    login: (req,res) => {
        const body = req.body;
        getUserByUserEmail(body.email,(err, results) => {
            if(err){
                console.log(err);
                return;
            }
            if(!results){
                return res.json({
                    success: 0,
                    data: "Invalid email or password"
                });
            }
            const result = compareSync(body.password, results.password);
            if(result){
                results.password = undefined;
                const jsontoken = sign({result: results}, "digitech", {
                    expiresIn: "30"
                });
                return res.json({
                    success: 1,
                    message: "login successfully",
                    token: jsontoken
                });
            } else{
                return res.json({
                    success: 0,
                    data: "Invalid email or password"
                });
            }
        });
    },
    login2: (req,res) => {
        const postData = req.body;
        const user = {
            "email": postData.email,
            "password": postData.password
        }
        getUserByUserEmail(postData.email,(err, results) => {
            if(err){
                console.log(err);
                return;
            }
            if(!results){
                return res.json({
                    success: -1,
                    message: "Invalid email"
                });
            }
            const result = compareSync(postData.password, results.password);
            if(result){
                results.password = undefined;
                // Đăng nhập thành công, tạo mã token cho user
                const token = jwt.sign(user, config.secret, {
                    expiresIn: config.tokenLife,
                });
                // Tạo một mã token khác - Refresh token
                const refreshToken = jwt.sign(user, config.refreshTokenSecret, {
                    expiresIn: config.refreshTokenLife
                });
                // Lưu lại mã Refresh token, kèm thông tin của user để sau này sử dụng lại
                tokenList[refreshToken] = user;
                console.log("----login----")
                console.log(user);
                console.log(tokenList);
                console.log("----/login----")
                // Trả lại cho user thông tin mã token kèm theo mã Refresh token
                return res.json({
                    success: 1,
                    message: "login successfully",
                    id: results.id,
                    firstName: results.firstName,
                    token,
                    refreshToken
                });
            } else{
                return res.json({
                    success: 0,
                    message: "Invalid password"
                });
            }
        });
    },
    refresh_token: async(req, res) => {
        // User gửi mã Refresh token kèm theo trong body
        //const { refreshToken } = req.body;
        let refreshToken = req.get("authorization").slice(7);
        //if(refreshToken){
            //refreshToken = refreshToken.slice(7);
        //}
        console.log("----refreshtoken----")
        console.log(refreshToken);
        console.log(tokenList[refreshToken]);
        console.log("----/refreshtoken----")
        // Kiểm tra Refresh token có được gửi kèm và mã này có tồn tại trên hệ thống hay không
        if ((refreshToken) && (refreshToken in tokenList)) {
            try {
            // Kiểm tra mã Refresh token
            await utils.verifyJwtToken(refreshToken, config.refreshTokenSecret);
            // Lấy lại thông tin user
            const user = tokenList[refreshToken];
            //console.log(user);
            // Tạo mới mã token và trả lại cho user
            const retoken = jwt.sign(user, config.secret, {
                expiresIn: config.tokenLife,
            });
            const response = {
                retoken,
            }
            res.status(200).json(response);
            } catch (err) {
            console.error(err);
            res.status(403).json({
                message: 'Invalid refresh token',
            });
            }
        } else {
            res.status(400).json({
            message: 'Invalid request',
            });
        }
    },
};