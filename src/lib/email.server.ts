const FROM_ADDRESS = process.env["RESEND_FROM_EMAIL"] || "Milan Students Network <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[email] Missing RESEND_API_KEY, skipping email to", to);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });
  if (error) {
    console.error("[email] send failed", to, subject, error);
  }
}

async function getAdminEmail(): Promise<string | null> {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data } = await getPublicClient()
    .from("site_settings")
    .select("value")
    .eq("key", "contact_email")
    .maybeSingle();
  return data?.value || null;
}

const wrapper = (title: string, bodyHtml: string) => `
  <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; color: #141b2e;">${title}</h1>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #8a8a8a;">Milan Students Network — milan-sn.it</p>
  </div>
`;

export async function sendAccommodationRequestEmails(input: {
  firstName: string;
  lastName: string;
  email: string;
  roomType: string;
  budgetRange: string;
  stayType: string;
}) {
  await sendEmail(
    input.email,
    "We've got your accommodation request",
    wrapper(
      "Thanks, we've got your request!",
      `<p>Hi ${input.firstName},</p>
       <p>Your accommodation request has been registered. You're looking for a <strong>${input.roomType}</strong>
       (${input.stayType.replace("_", " ")}), budget ${input.budgetRange}.</p>
       <p>Our matching team is working on it and will contact you as soon as a suitable place is available.</p>`,
    ),
  );

  const adminEmail = await getAdminEmail();
  if (adminEmail) {
    await sendEmail(
      adminEmail,
      `New accommodation request: ${input.firstName} ${input.lastName}`,
      wrapper(
        "New accommodation request",
        `<p><strong>${input.firstName} ${input.lastName}</strong> (${input.email})</p>
         <p>${input.roomType} — ${input.stayType.replace("_", " ")} — budget ${input.budgetRange}</p>
         <p>Review it in the admin panel under Accommodation Requests.</p>`,
      ),
    );
  }
}

export async function sendContactMessageEmails(input: {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}) {
  await sendEmail(
    input.email,
    "We've got your message",
    wrapper(
      "Thanks for writing in!",
      `<p>Hi ${input.fullName},</p>
       <p>We've received your message about "<strong>${input.subject}</strong>" and a real student on our team
       will reply within two days.</p>`,
    ),
  );

  const adminEmail = await getAdminEmail();
  if (adminEmail) {
    await sendEmail(
      adminEmail,
      `New contact message: ${input.subject}`,
      wrapper(
        "New contact message",
        `<p><strong>${input.fullName}</strong> (${input.email})</p>
         <p><strong>${input.subject}</strong></p>
         <p>${input.message.replace(/\n/g, "<br>")}</p>`,
      ),
    );
  }
}

export async function sendAccommodationListingEmails(input: {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  neighborhood: string;
}) {
  await sendEmail(
    input.email,
    "Your accommodation listing has been registered",
    wrapper(
      "Thanks, your listing is in!",
      `<p>Hi ${input.firstName},</p>
       <p>Your listing "<strong>${input.title}</strong>" in ${input.neighborhood} has been registered.</p>
       <p>Our team will review it and it'll go live once approved. We'll be in touch as soon as we find a match.</p>`,
    ),
  );

  const adminEmail = await getAdminEmail();
  if (adminEmail) {
    await sendEmail(
      adminEmail,
      `New listing to review: ${input.title}`,
      wrapper(
        "New accommodation listing",
        `<p><strong>${input.firstName} ${input.lastName}</strong> (${input.email})</p>
         <p>"${input.title}" — ${input.neighborhood}</p>
         <p>Review it in the admin panel under Accommodation.</p>`,
      ),
    );
  }
}
