"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// utils/sendgrid.ts
var sendgrid_exports = {};
__export(sendgrid_exports, {
  sendTicketEmail: () => sendTicketEmail
});
module.exports = __toCommonJS(sendgrid_exports);

// app/types/enums.ts
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["Promoter"] = "org:promoter";
  UserRole2["Moderator"] = "org:moderator";
  UserRole2["Manager"] = "org:manager";
  UserRole2["Admin"] = "org:admin";
  UserRole2["Hostly_Admin"] = "org:hostly_admin";
  UserRole2["Hostly_Moderator"] = "org:hostly_moderator";
  return UserRole2;
})(UserRole || {});
var changeableRoles = Object.values(UserRole).filter(
  (role) => role !== "org:admin" /* Admin */ && role !== "org:hostly_admin" /* Hostly_Admin */ && role !== "org:hostly_moderator" /* Hostly_Moderator */
);

// utils/sendgrid.ts
var import_buffer = require("buffer");
var sendTicketEmail = async (to, pdfBuffer, filename = "tickets.pdf") => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("Missing SENDGRID_API_KEY" /* SENDGRID_MISSING_API_KEY */);
  }
  const url = "https://api.sendgrid.com/v3/mail/send";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }]
          }
        ],
        from: {
          email: "david.anuson@gmail.com",
          name: "Hostly"
        },
        subject: "Your Tickets",
        content: [
          {
            type: "text/plain",
            value: "Attached are your tickets."
          }
        ],
        attachments: [
          {
            content: import_buffer.Buffer.from(pdfBuffer).toString("base64"),
            filename,
            type: "application/pdf",
            disposition: "attachment"
          }
        ]
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Sendgrid error sending email" /* SENDGRID_EMAIL */);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendTicketEmail
});
