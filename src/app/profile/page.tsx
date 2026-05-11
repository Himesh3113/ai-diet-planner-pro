import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getProtectedProfileContext } from "@/lib/profile";

export default async function ProfilePage() {
  const { email, metrics, profile, user } = await getProtectedProfileContext();

  return (
    <OnboardingForm
      email={profile?.email ?? email}
      metrics={metrics}
      mode="profile"
      profile={profile}
      userId={user.id}
    />
  );
}
