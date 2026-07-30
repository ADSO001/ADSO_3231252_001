import jwt from "jsonwebtoken";

const protegerRuta = (req, res, next) => {

    const token = req.cookies._token;

    if (!token) {
        return res.redirect("login");
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = decoded;

        return next();

    } catch (error) {

        return res
            .clearCookie("_token")
            .redirect("login");
    }
}

export default protegerRuta;