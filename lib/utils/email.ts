export function openGmailCompose(options: {
  to?: string;
  subject: string;
  body: string;
}) {
  const { to = "", subject, body } = options;
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  });
  window.open(`https://mail.google.com/mail/?${params.toString()}`, "_blank");
}

export function openMailto(options: {
  to?: string;
  subject: string;
  body: string;
}) {
  const { to = "", subject, body } = options;
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, "_blank");
}

export function getMessageSubject(card: {
  recipient_name: string;
  message_subject?: string;
  category?: string;
}) {
  if (card.message_subject) return card.message_subject;
  return `Quick question for ${card.recipient_name}`;
}
