import nodemailer from "nodemailer"
import EventResponse from "./EventResponse"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "jarvis14220@gmail.com",
        pass: "npjbzqmynvkbsjok"
    }
});

const sendForgotPasswordEmail = async (email, username, otp) => {
    try {
        const mailOptions = {
            from: "jarvis14220@gmail.com",
            to: email,
            subject: "Forgot Password",
            html: `
            <h2>HI ${username},</h2>
            <p>There was a request to change your password!</p>
            <p>If you did not make this request then please report in our email : akay93796@gmail.com.</p>
            <p>Otherwise, Do not share the OTP.</p>
            <br>
            <p style="font-weight:bold; font-size: large; ">OTP : ${otp}</p>
            `
        };


        const info = await transporter.sendMail(mailOptions)
    } catch (error) {
        throw new EventResponse(false, "Something Went Wrong! Or Check Internet Connection.", error)
    }
}

export default sendForgotPasswordEmail;