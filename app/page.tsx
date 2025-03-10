import Link from "next/link"
import { MedalIcon, PlayIcon, CalendarIcon, BarChart3Icon, UserCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-2">
              <MedalIcon className="h-6 w-6" />
              <span className="font-bold text-xl">MindMeld</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="hover:text-indigo-200 transition">
                Features
              </Link>
              <Link href="#how-it-works" className="hover:text-indigo-200 transition">
                How It Works
              </Link>
              <Link href="#achievements" className="hover:text-indigo-200 transition">
                Achievements
              </Link>
              <Link href="#community" className="hover:text-indigo-200 transition">
                Community
              </Link>
              <Link href="/contact" className="hover:text-indigo-200 transition">
                Contact
              </Link>
            </nav>
            <Link href="/auth/sign-in">
              <Button className="bg-white text-indigo-600 hover:bg-indigo-100">Sign In</Button>
            </Link>
          </div>

          <div className="py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Your Daily Brain Workout</h1>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Challenge your mind with interactive puzzles, riddles, and logic games designed to boost your cognitive
              function.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/challenges">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-100 w-full sm:w-auto">
                  <PlayIcon className="mr-2 h-5 w-5" />
                  Get Started Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Install PWA
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden md:block h-20 bg-gradient-to-b from-purple-600/0 to-purple-600/10"></div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Supercharge Your Cognitive Abilities</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard
              icon={<PlayIcon className="h-8 w-8 text-indigo-600" />}
              title="Daily Brain Challenges"
              description="Fresh puzzles, riddles, and logic games each day to keep your mind agile and sharp."
            />
            <FeatureCard
              icon={<BarChart3Icon className="h-8 w-8 text-indigo-600" />}
              title="Adaptive Difficulty"
              description="Challenges that evolve with you, ensuring the perfect balance between fun and challenge."
            />
            <FeatureCard
              icon={<CalendarIcon className="h-8 w-8 text-indigo-600" />}
              title="Progress Tracking"
              description="Monitor your cognitive growth with detailed metrics and beautiful interactive charts."
            />
            <FeatureCard
              icon={<UserCircleIcon className="h-8 w-8 text-indigo-600" />}
              title="Personalized Experience"
              description="Customized brain training based on your strengths, weaknesses, and preferences."
            />
            <FeatureCard
              icon={<MedalIcon className="h-8 w-8 text-indigo-600" />}
              title="Achievements & Rewards"
              description="Earn badges and trophies as you conquer challenges and maintain your daily streaks."
            />
            <FeatureCard
              icon={<BarChart3Icon className="h-8 w-8 text-indigo-600" />}
              title="Leaderboards"
              description="Compare your scores with a community of fellow brain enthusiasts worldwide."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-purple-50 to-indigo-50">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How MindMeld Works</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Sign Up"
              description="Create your free account in seconds and set your goals."
            />
            <StepCard
              number="2"
              title="Choose a Challenge"
              description="Select from various puzzles, riddles, and logic games."
            />
            <StepCard
              number="3"
              title="Solve & Earn"
              description="Complete challenges to earn points and unlock badges."
            />
            <StepCard
              number="4"
              title="Track & Compete"
              description="Monitor your progress and compare with friends."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Our Users Say</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              role="Teacher"
              content="MindMeld has become my morning ritual. I've noticed a significant improvement in my problem-solving abilities after just one month!"
            />
            <TestimonialCard
              name="David Chen"
              role="Software Engineer"
              content="As someone who codes all day, I was looking for different mental challenges. MindMeld delivers exactly what I needed with its variety of puzzles."
            />
            <TestimonialCard
              name="Maria Rodriguez"
              role="Retired Accountant"
              content="At 67, keeping my mind active is crucial. MindMeld makes brain training fun and I love competing with my grandchildren on the leaderboards!"
            />
          </div>
        </div>
      </section>

      {/* PWA Section */}
      <section id="pwa" className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Train Your Brain Anytime, Anywhere</h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Install MindMeld as a Progressive Web App for offline access and a seamless, app-like experience.
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-100">
            Install MindMeld PWA
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MedalIcon className="h-6 w-6" />
                <span className="font-bold text-xl">MindMeld</span>
              </div>
              <p className="text-gray-400">Your daily brain workout for a sharper, more agile mind.</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-white transition">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-gray-400 hover:text-white transition">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-400 hover:text-white transition">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} MindMeld. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TestimonialCard({ name, role, content }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center gap-1 text-yellow-500 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-600 mb-4">{content}</p>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  )
}

