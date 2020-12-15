const jwt = require("jsonwebtoken");

module.exports = async(req, res, next, err) => {
    if (!req.headers.authorization) {
        res.status(401).json({
            message: "Access Denied",
            err: err,
        });
    } else {
        let authIV = req.headers.authorization.split(' ')[1]
        if (authIV === null) {
            res.status(401).json({
                message: "Access Denied",
                err: err,
            });
        } else if (authIV != req.body.iv) {
            res.status(401).json({
                message: "Access Denied",
                err: err,
            });
        } else {
            var iv = req.body.iv;
            if (iv === null || iv === undefined || iv === " ") {
                res.status(401).json({
                    message: "Access Denied",
                    err: err,
                });
            } else {
                try {
                    var verified = jwt.verify(iv, process.env.TOKEN_SECRET);
                    req.user = verified;
                    next();
                } catch (err) {
                    res.status(401).json({
                        message: "Access Denied",
                        err: err,
                    });
                }
            }
        }
    }
};