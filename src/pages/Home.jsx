import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Github, Zap, ShieldCheck, Layers, MoveRight } from "lucide-react";
import useAuthStore from "@/store/auth";

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Instant Deployments",
    description:
      "Connect your GitHub repository and deploy your static frontends in seconds.",
  },
  {
    icon: <Layers className="h-8 w-8 text-secondary" />,
    title: "Automated Workflows",
    description:
      "We automatically set up a GitHub Actions workflow. Push to git, and we handle the rest.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-accent" />,
    title: "Global CDN",
    description:
      "Your site is deployed to a global CDN for lightning-fast load times, everywhere.",
  },
];

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <section className="relative w-full py-24 md:py-32 lg:py-40">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] -z-10"></div>
          <div className="container px-4 md:px-6 text-center">
            <div className="flex flex-col items-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-primary">
                Deploy Your Frontend, Instantly.
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Frontbase is the seamless deployment platform for modern web
                projects. Connect your GitHub repositories, automate your CI/CD
                pipeline, and let us handle the rest.
              </p>
              <div className="w-full max-w-sm">
                {isAuthenticated ? (
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-card text-card-foreground hover:bg-muted transition-all duration-300 group"
                  >
                    <Link to="/dashboard">
                      Go to Dashboard{" "}
                      <MoveRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-card text-card-foreground hover:bg-muted transition-all duration-300 group"
                  >
                    <Link to="/login">
                      <Github className="mr-2 h-5 w-5" />
                      Get Started with GitHub
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 border-t border-border"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Everything You Need to Deploy
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                From automated builds to global distribution, Frontbase provides
                a seamless deployment experience.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="relative group grid gap-4 p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute -top-1 -left-1 w-24 h-24 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex justify-center mb-2">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Frontbase. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
