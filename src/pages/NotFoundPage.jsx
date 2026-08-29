import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/common/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-navy-600">
        <Compass size={28} />
      </div>
      <h1 className="font-display text-3xl font-extrabold text-ink-900">404</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button className="mt-6" onClick={() => navigate("/")}>
        Back to Home
      </Button>
    </div>
  );
}
