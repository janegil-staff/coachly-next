// src/app/delete-account/page.jsx
//
// Account deletion request page for Coachly. Required by Google Play (2023+).
// URL: https://quptrain.com/delete-account
//
// Replace {{CONTACT_EMAIL}} with your real email before deploying.

export const metadata = {
  title: "Delete your Coachly account",
  description:
    "How to request deletion of your Coachly account and all associated data.",
};

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Delete your Coachly account
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          You can delete your Coachly account and all associated training data
          at any time. This page explains how.
        </p>
      </header>

      <Section title="Delete from within the app (recommended)">
        <ol className="ml-6 list-decimal space-y-2">
          <li>Open the Coachly app on your phone.</li>
          <li>Sign in with your account if you are not already signed in.</li>
          <li>
            Go to <strong>Settings</strong> (the gear icon, top right).
          </li>
          <li>
            Scroll to the bottom and tap <strong>Delete account</strong>.
          </li>
          <li>
            Confirm the deletion. The action is permanent and cannot be undone.
          </li>
        </ol>
      </Section>

      <Section title="Delete by email request">
        <p>
          If you no longer have access to the app, you can request account
          deletion by email. Send a message from the email address registered to
          your Coachly account to:
        </p>
        <p className="mt-3">
          <a
            href={`mailto:jan.egi.staff@qupda.com?subject=Delete%20my%20Coachly%20account`}
            className="text-blue-700 underline hover:text-blue-900"
          >
            jan.egi.staff@qupda.com
          </a>
        </p>
        <p className="mt-3">
          Include the subject line{" "}
          <em>&quot;Delete my Coachly account&quot;</em> so we can identify your
          request quickly. We will verify the email address matches the one on
          file before completing the deletion.
        </p>
        <p>
          Email requests are processed within 7 business days. We may contact
          you if we need to verify your identity before proceeding.
        </p>
      </Section>

      <Section title="What gets deleted">
        <p>When you delete your account, we permanently delete:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Your account record (email, password hash, profile)</li>
          <li>
            All your training logs (workouts, mood, sleep, soreness, energy,
            effort, notes)
          </li>
          <li>Your goals and questionnaire responses</li>
          <li>Your push notification token (if reminders were enabled)</li>
          <li>Any active share codes you have generated</li>
        </ul>
        <p>
          The deletion is permanent — once removed, your data cannot be
          recovered.
        </p>
      </Section>

      <Section title="What may be retained, and for how long">
        <p>
          A small amount of data may be retained for limited periods after
          account deletion:
        </p>
        <ul className="ml-6 list-disc space-y-1">
          <li>
            <strong>Encrypted database backups:</strong> our backups are rotated
            and your data is fully removed from backups within{" "}
            <strong>90 days</strong>.
          </li>
          <li>
            <strong>Anonymized error logs:</strong> if any of your sessions
            triggered an error before deletion, the error log itself does not
            include personal information and may be retained as part of our
            diagnostic records.
          </li>
          <li>
            <strong>Records required by law:</strong> if applicable law requires
            us to keep certain records (for example, evidence of consent), we
            retain only the minimum necessary for the legally required period.
          </li>
        </ul>
      </Section>

      <Section title="Your rights">
        <p>
          In addition to deletion, you have the right to access, correct, or
          export your data, and to withdraw any consent you previously gave. See
          our{" "}
          <a
            href="/privacy"
            className="text-blue-700 underline hover:text-blue-900"
          >
            Privacy Policy
          </a>{" "}
          for full details.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          If you have questions about account deletion or data retention,
          contact:
        </p>
        <address className="not-italic">
          <strong>Qup DA</strong>
          <br />
          Org. nr. 912 372 022
          <br />
          Norway
          <br />
          <a
            href={`mailto:jan.egi.staff@qupda.com`}
            className="text-blue-700 underline hover:text-blue-900"
          >
            jan.egi.staff@qupda.com
          </a>
        </address>
      </Section>
    </main>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-slate-900">{title}</h2>
      <div className="space-y-3 text-base leading-relaxed text-slate-700">
        {children}
      </div>
    </section>
  );
}
