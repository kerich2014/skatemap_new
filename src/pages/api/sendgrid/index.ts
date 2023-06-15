import sendgrid from "@sendgrid/mail";
import { env } from "../../../env.mjs";
import { NextRequest, NextResponse } from "next/server";

sendgrid.setApiKey(env.SENDGRID_API_KEY);

async function sendEmail(req: NextRequest, res: NextResponse) {
    // console.log("REQ.BODY", req.body);
    const {link} = await req.json()
    await sendgrid.send({
      to: "skatemapspb@mail.ru", // Your email where you'll receive emails
      from: "skatemapspb@mail.ru", // your website email address here
      subject: `Hello world`,
      html: `<div>${link}</div>`,
    });
}

export default sendEmail;