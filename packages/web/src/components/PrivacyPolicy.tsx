import { Button } from "@/components/ui/button";

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="link" onClick={onBack} className="text-sm text-primary p-0 h-auto">
          &larr; Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: March 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-foreground/80">
          <section>
            <h2 className="text-lg font-semibold text-foreground">What We Collect</h2>
            <p>When you create an account, we store:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account data</strong> — email address, display name, hashed password (managed by Neon Auth)
              </li>
              <li>
                <strong>Health data</strong> — blood test results, lab values, biomarker data, profile information
                (name, date of birth, sex) that you voluntarily enter
              </li>
              <li>
                <strong>Preferences</strong> — language and theme settings (stored in your browser only, not on our
                servers)
              </li>
            </ul>
            <p>
              We do <strong>not</strong> collect analytics, tracking data, IP addresses, or any data beyond what you
              explicitly provide.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">How We Use Your Data</h2>
            <p>Your data is used exclusively to provide the service:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Displaying your lab results and biomarker trends</li>
              <li>Computing analytics (biological age, trend analysis, correlations) on our server</li>
              <li>
                Generating AI analysis prompts (the prompt is returned to you — we do not send it to any AI provider)
              </li>
            </ul>
            <p>
              We do <strong>not</strong> sell, share, or transfer your data to any third party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">MCP (AI Integration)</h2>
            <p>
              OpenMarkers provides an MCP endpoint that you can connect to AI assistants (Claude, ChatGPT, etc.). When
              you do this:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The AI assistant requests your data through the MCP endpoint using your authentication token</li>
              <li>
                <strong>You</strong> initiate every data request — we never push data to AI providers
              </li>
              <li>
                Once data reaches the AI provider, their privacy policy applies — we have no control over how they
                process it
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Data Storage & Security</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Data is stored in Neon Postgres (encrypted at rest and in transit)</li>
              <li>Authentication uses JWT tokens with RS256 signature verification</li>
              <li>All API endpoints require authentication — your data is never accessible without your credentials</li>
              <li>Passwords are hashed and managed by Neon Auth (we never see or store plaintext passwords)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Your Rights</h2>
            <p>You can exercise these rights at any time from the Settings page:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Access</strong> — view all your data in the app
              </li>
              <li>
                <strong>Export</strong> — download all your data as JSON
              </li>
              <li>
                <strong>Rectification</strong> — edit your results, profiles, and account information
              </li>
              <li>
                <strong>Erasure</strong> — delete your account and all associated data permanently
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
            <p>
              We use a single session cookie set by Neon Auth for authentication purposes only. We do not use tracking
              cookies, analytics cookies, or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Data Retention</h2>
            <p>
              Your data is stored as long as your account exists. When you delete your account, all profiles, biomarker
              data, and results are permanently removed from our database.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p>
              For privacy-related questions, open an issue on our{" "}
              <a
                href="https://github.com/nezdemkovski/openmarkers"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
