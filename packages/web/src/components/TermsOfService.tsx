import { Button } from "@/components/ui/button";

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="link" onClick={onBack} className="text-sm text-primary p-0 h-auto">
          &larr; Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: March 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-foreground/80">
          <section>
            <h2 className="text-lg font-semibold text-foreground">What This Service Is</h2>
            <p>
              OpenMarkers is a personal biomarker tracking tool. It stores lab results you enter and displays them as
              charts and analytics. That's it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Not Medical Advice</h2>
            <p>
              <strong>OpenMarkers is not a medical device, healthcare service, or diagnostic tool.</strong> The
              analytics, trends, biological age estimates, and any other computed values are for informational purposes
              only. They do not constitute medical advice, diagnosis, or treatment recommendations.
            </p>
            <p>
              Always consult a qualified healthcare professional for medical decisions. Do not make health decisions
              based solely on data from this service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>You own your data.</strong> We store it on your behalf.
              </li>
              <li>You can export all your data as JSON at any time.</li>
              <li>You can delete your account and all data at any time — deletion is permanent and immediate.</li>
              <li>We do not sell, share, or monetize your data in any way.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Health Data Consent</h2>
            <p>
              By creating an account, you explicitly consent to the storage of your health-related data (blood test
              results, lab values, biomarker data) as defined under GDPR Article 9. You can withdraw this consent at any
              time by deleting your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">AI Integration (MCP)</h2>
            <p>
              OpenMarkers provides an MCP endpoint you can optionally connect to AI assistants. When you connect an AI
              tool:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are choosing to share your health data with that AI provider</li>
              <li>We have no control over how the AI provider processes your data</li>
              <li>The AI provider's own terms and privacy policy apply to that interaction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Accuracy</h2>
            <p>
              We do our best to compute analytics correctly, but we make no guarantees about the accuracy of any
              calculations, including biological age estimates, trend analysis, or reference range comparisons. The data
              you enter is displayed as-is — we do not validate its medical accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Availability</h2>
            <p>
              This is an open-source project provided as-is, with no guaranteed uptime or support. We may modify or
              discontinue the service at any time. We recommend regularly exporting your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, OpenMarkers and its contributors are not liable for any damages
              arising from the use of this service, including but not limited to health decisions made based on data or
              analytics provided by the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Open Source</h2>
            <p>
              OpenMarkers is open-source software. The source code is available on{" "}
              <a
                href="https://github.com/nezdemkovski/openmarkers"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              . You can self-host your own instance if you prefer full control over your data.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
