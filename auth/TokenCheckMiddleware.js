const config = require('./config');
const utils = require('./utils');

// module.exports = {
//     TokenCheckMiddleware: async (req, res, next) => {
//         // Lấy thông tin mã token được đính kèm trong request
//         //const token = req.body.token || req.query.token || req.headers['x-access-token'];
//         let token = req.get("authorization");
//         // decode token
//         if (token) {
//             token = token.slice(7);
//             // Xác thực mã token và kiểm tra thời gian hết hạn của mã
//             try {
//             const decoded = await utils.verifyJwtToken(token, config.secret);
//             // Lưu thông tin giã mã được vào đối tượng req, dùng cho các xử lý ở sau
//             req.decoded = decoded;
//             next();
//             } catch (err) {
//             // Giải mã gặp lỗi: Không đúng, hết hạn...
//             console.error(err);
//             return res.status(401).json({
//                 message: 'Unauthorized access1.',
//             });
//             }
//         } else {
//             // Không tìm thấy token trong request
//             return res.status(403).send({
//             message: 'No token provided.',
//             });
//         }
//     }
// }

module.exports = {
    TokenCheckMiddleware: async (req, res, next) => {
        // Lấy thông tin mã token được đính kèm trong request
        //const token = req.body.token || req.query.token || req.headers['x-access-token'];
        let token = req.get("authorization");
        // decode token
        if (token) {
            token = token.slice(7);
            // Xác thực mã token và kiểm tra thời gian hết hạn của mã
            try {
            const decoded = await utils.verifyJwtToken(token, config.secret);
            // Lưu thông tin giã mã được vào đối tượng req, dùng cho các xử lý ở sau
            req.decoded = decoded;
            next();
            } catch (err) {
            // Giải mã gặp lỗi: Không đúng, hết hạn...
            //console.error(err);
                return res.status(401).json({
                    message: 'Unauthorized access1.',
                });
            }
        } else {
            // Không tìm thấy token trong request
            return res.status(403).send({
            message: 'No token provided.',
            });
        }
    }
}

// module.exports = {
//     checkToken: (req, res, next) => {
//         let token = req.get("authorization");
//         if(token){
//             token = token.slice(7); 
//             verify(token, "digitech",(err, decoded) => {
//                 if(err){
//                     res.json({
//                         success: 0,
//                         message: "Invalid token"
//                     });
//                 }else{
//                     next(); //middleware
//                 }
//             })
//         }else{
//             res.json({
//                 success: 0,
//                 message: "Access denied! unauthorized user"
//             })
//         }
//     }
// }