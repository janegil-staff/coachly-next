// src/app/privacy/page.js
//
// Privacy policy for the Coachly mobile app and the quptrain.com share-report viewer.
// Drop into Next.js App Router at app/privacy/page.js. URL: https://quptrain.com/privacy
//
// IMPORTANT — placeholders to fill in before publishing:
//   - {{CONTACT_EMAIL}} — privacy contact email (e.g. privacy@qupda.com)
//   - {{LAST_UPDATED}}  — date of last update (e.g. "May 3, 2026")
//
// Search-and-replace those two strings before deploying. Everything else
// reflects what's typical for Coachly (MongoDB Atlas EU, Expo push, no
// third-party analytics, no ads). Adjust as needed if anything changes.

export const metadata = {
  title: "Privacy Policy — Coachly",
  description:
    "How Coachly (Qup DA) collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <header className="mb-10 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: 03 May 2026
        </p>
        <p className="mt-4 text-base leading-relaxed">
          This Privacy Policy explains how Qup DA collects, uses, and protects
          information about you when you use the Coachly mobile application and
          the related coach-viewing website at{" "}
          <a
            href="https://quptrain.com"
            className="text-blue-700 underline hover:text-blue-900"
          >
            quptrain.com
          </a>
          .
        </p>
      </header>

      <Section title="1. Who we are">
        <p>
          Coachly is operated by <strong>Qup DA</strong> (Norwegian organization
          number <strong>912 372 022</strong>), with its registered office in
          Norway. Qup DA is the data controller for the personal information
          processed through the Coachly app and the quptrain.com website.
        </p>
        <p>
          For any privacy questions, requests, or complaints, contact us at{" "}
          <a
            href={`mailto:${"{{CONTACT_EMAIL}}"}`}
            className="text-blue-700 underline hover:text-blue-900"
          >
            {`{{CONTACT_EMAIL}}`}
          </a>
          .
        </p>
      </Section>

      <Section title="2. What information we collect">
        <p>We collect only what we need to provide the service:</p>

        <Subsection title="Information you provide directly">
          <ul className="ml-6 list-disc space-y-1">
            <li>
              <strong>Account details:</strong> email address, password (stored
              hashed), and a 6-digit PIN you set.
            </li>
            <li>
              <strong>Profile details:</strong> age, gender (optional), height,
              weight (optional), preferred language.
            </li>
            <li>
              <strong>Training and well-being logs:</strong> workout type,
              duration, effort, mood, energy, sleep quality, soreness, and any
              personal notes you write.
            </li>
            <li>
              <strong>Goals and questionnaire responses:</strong> goals you set,
              your progress on them, and answers to optional well-being
              questionnaires.
            </li>
          </ul>
        </Subsection>

        <Subsection title="Information collected automatically">
          <ul className="ml-6 list-disc space-y-1">
            <li>
              <strong>Device push token:</strong> if you enable daily reminders,
              your device's push notification token is stored so we can send
              reminders to your device. The token is not used for marketing or
              analytics.
            </li>
            <li>
              <strong>Basic technical data:</strong> when you connect to our
              servers, we receive your device's IP address. We do not store IP
              addresses long-term and do not use them to track you across
              services.
            </li>
            <li>
              <strong>Crash and error logs:</strong> if the app crashes, we may
              receive a generic crash report (error message, stack trace, device
              model). These reports do not include your training data or
              personal identifiers.
            </li>
          </ul>
        </Subsection>

        <Subsection title="Information from third parties">
          <p>
            We do not buy, rent, or receive personal information about you from
            data brokers or advertisers.
          </p>
        </Subsection>
      </Section>

      <Section title="3. How we use your information">
        <p>We use your information only for these purposes:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>
            <strong>To run the service:</strong> store your training logs,
            display your progress, calculate scores, and let you generate share
            codes for your coach.
          </li>
          <li>
            <strong>To authenticate you:</strong> verify your email/password or
            PIN at sign-in.
          </li>
          <li>
            <strong>To send the reminders you enabled:</strong> if you turn on
            daily reminders, we send a push notification at the time you choose.
          </li>
          <li>
            <strong>To respond to support requests:</strong> if you contact us,
            we use your email and the contents of your message to reply.
          </li>
          <li>
            <strong>To improve and secure the service:</strong> diagnose
            crashes, prevent abuse, and keep the service running.
          </li>
          <li>
            <strong>To comply with legal obligations:</strong> respond to valid
            legal requests where we are required to do so.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> use your data for advertising, do{" "}
          <strong>not</strong> sell or rent it, and do <strong>not</strong>{" "}
          share it with advertisers or data brokers.
        </p>
      </Section>

      <Section title="4. Legal basis for processing (GDPR)">
        <p>If you are in the EU/EEA, our legal bases under the GDPR are:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>
            <strong>Performance of a contract</strong> (Article 6(1)(b)) — for
            everything required to deliver the Coachly service to you.
          </li>
          <li>
            <strong>Consent</strong> (Article 6(1)(a)) — for optional features
            such as daily reminders and sharing your data with a coach. You can
            withdraw consent at any time.
          </li>
          <li>
            <strong>Legitimate interests</strong> (Article 6(1)(f)) — for
            keeping the service secure and free from abuse.
          </li>
          <li>
            <strong>Explicit consent for special-category data</strong> (Article
            9(2)(a)) — training and well-being entries (mood, sleep, soreness)
            may be considered health-related data. By logging these, you give
            explicit consent for us to process them solely to provide the
            service.
          </li>
        </ul>
      </Section>

      <Section title="5. Sharing your data with a coach">
        <p>
          Coachly lets you generate a 6-digit code that gives a coach access to
          a read-only training report at quptrain.com. The code is valid for 10
          minutes and does not require the coach to create an account.
        </p>
        <p>The coach can see only what you choose to share:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Your training logs and category breakdown</li>
          <li>Goals and questionnaire scores (if completed)</li>
          <li>
            Personal notes — only if you toggle &quot;Include personal
            notes&quot; ON
          </li>
        </ul>
        <p>
          Each share is initiated by you. Codes expire automatically. You can
          revoke access at any time by not generating a new code.
        </p>
      </Section>

      <Section title="6. Where your data is stored">
        <p>
          Your data is stored in secure cloud databases (MongoDB Atlas) hosted
          in the European Union. Backups are encrypted and stored in the same
          region. Data is transmitted between your device and our servers over
          standard HTTPS/TLS.
        </p>
        <p>
          We do not transfer personal data outside the EU/EEA, except as
          required for the operation of services such as Apple Push Notification
          Service or Firebase Cloud Messaging when you enable push
          notifications. These transfers are covered by Standard Contractual
          Clauses where applicable.
        </p>
      </Section>

      <Section title="7. How long we keep your data">
        <p>
          We keep your account and training data for as long as your account
          exists. If you delete your account from within the app, we delete your
          account record and associated training logs from our active databases
          within 30 days. Encrypted backups are rotated and fully deleted within
          90 days.
        </p>
        <p>
          We may retain limited records (such as anonymized error logs or legal
          compliance records) for longer if we are required to by law.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>If you are in the EU/EEA, you have the right to:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>Delete your data (&quot;right to be forgotten&quot;)</li>
          <li>Restrict or object to certain processing</li>
          <li>
            Receive a copy of your data in a portable format (data portability)
          </li>
          <li>Withdraw consent at any time</li>
          <li>
            Lodge a complaint with the Norwegian Data Protection Authority
            (Datatilsynet) or your local supervisory authority
          </li>
        </ul>
        <p>
          You can exercise most of these rights directly in the app — for
          example, deleting your account from Settings, or editing your profile
          data. For anything else, email us at{" "}
          <a
            href={`mailto:${"{{CONTACT_EMAIL}}"}`}
            className="text-blue-700 underline hover:text-blue-900"
          >
            jan.egil.staff@qupda.com
          </a>{" "}
          and we will respond within 30 days.
        </p>
      </Section>

      <Section title="9. Security">
        <p>We protect your data with industry-standard security measures:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>HTTPS/TLS encryption for all network traffic</li>
          <li>
            Passwords stored as one-way bcrypt hashes — never in plain text
          </li>
          <li>
            PIN stored on your device using the operating system's secure
            storage (Keychain on iOS, Keystore on Android)
          </li>
          <li>JWT-based authentication tokens with limited lifetime</li>
          <li>Encrypted database backups</li>
          <li>Restricted server access via principle of least privilege</li>
        </ul>
        <p>
          No service is 100% secure, but we work continuously to reduce risk. If
          we ever suffer a data breach affecting your personal information, we
          will notify you and the relevant authorities as required by law.
        </p>
      </Section>

      <Section title="10. Children">
        <p>
          Coachly is not intended for children under the age of 16. We do not
          knowingly collect personal data from children under 16. If you believe
          a child has signed up for Coachly, please contact us and we will
          promptly delete the account.
        </p>
      </Section>

      <Section title="11. Cookies and the quptrain.com website">
        <p>
          The quptrain.com website is used to display read-only training reports
          when a coach enters a 6-digit share code provided by a Coachly user.
          The site uses only essential, first-party cookies required for the
          page to function. We do <strong>not</strong> use tracking cookies,
          analytics cookies, or advertising cookies.
        </p>
      </Section>

      <Section title="12. Third-party services">
        <p>
          Coachly relies on a small set of third-party services to operate. Each
          is bound by its own privacy terms:
        </p>
        <ul className="ml-6 list-disc space-y-1">
          <li>
            <strong>MongoDB Atlas</strong> (database hosting, EU region)
          </li>
          <li>
            <strong>Apple Push Notification Service (APNs)</strong> and{" "}
            <strong>Firebase Cloud Messaging (FCM)</strong> for push
            notifications, if you enable reminders
          </li>
          <li>
            <strong>Expo</strong> for app distribution and push notification
            routing
          </li>
          <li>
            <strong>Apple App Store and Google Play</strong> for app
            distribution and update delivery
          </li>
        </ul>
      </Section>

      <Section title="13. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. When we make
          material changes, we will update the &quot;Last updated&quot; date at
          the top of this page and, where required, notify you in the app or by
          email. Continued use of Coachly after a change means you accept the
          updated policy.
        </p>
      </Section>

      <Section title="14. Contact">
        <p>
          For privacy questions or to exercise your rights under this policy,
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
            href={`mailto:jan.egil.staff@qupda.com`}
            className="text-blue-700 underline hover:text-blue-900"
          >
            jan.egil.staff@qupda.com
          </a>
        </address>
      </Section>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <p>
          You can also view our{" "}
          <a
            href="/terms"
            className="text-blue-700 underline hover:text-blue-900"
          >
            Terms of Service
          </a>
          .
        </p>
      </footer>
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

function Subsection({ title, children }) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
