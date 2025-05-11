import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Users, Clock, BarChart3, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-blue-600 rounded-md rotate-45 transform origin-center"></div>
              <div className="absolute inset-1 bg-blue-500 rounded-sm rotate-45 transform origin-center"></div>
              <div className="absolute inset-2 bg-blue-400 rounded-sm rotate-45 transform origin-center"></div>
            </div>
            <span className="text-xl font-bold">WorkForce</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-blue-600 transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Log in
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/3"></div>
        </div>

        <div className="container relative">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="flex flex-col gap-6 max-w-xl">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Workforce Management Simplified
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Manage your team with <span className="text-blue-600">confidence</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                WorkForce helps you streamline HR operations, boost productivity, and create a better workplace for your
                employees with our all-in-one management solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-bold">500+</span> companies trust WorkForce
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-xl blur-xl"></div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  width={800}
                  height={600}
                  alt="WorkForce Dashboard"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-xs">Customer Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Trusted by logos */}
          <div className="mt-20">
            <p className="text-center text-sm font-medium text-slate-500 mb-6">TRUSTED BY LEADING COMPANIES</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
              {["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"].map((company, i) => (
                <div key={i} className="text-xl font-bold text-slate-400">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to manage your workforce</h2>
            <p className="text-slate-600 text-lg">
              Our comprehensive platform provides all the tools you need to streamline HR operations, boost
              productivity, and create a better workplace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-6 w-6 text-blue-600" />}
              title="Employee Management"
              description="Easily manage employee information, documents, and performance reviews in one place."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-green-600" />}
              title="Time Tracking"
              description="Track attendance, time off, and work hours with automated reporting and insights."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
              title="Performance Analytics"
              description="Gain valuable insights into team performance with customizable dashboards and reports."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-amber-600" />}
              title="Compliance Management"
              description="Stay compliant with labor laws and regulations with built-in compliance tools."
            />
          </div>

          <div className="mt-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Streamline your HR operations</h3>
                <p className="text-slate-600 mb-6 text-lg">
                  WorkForce automates repetitive HR tasks, freeing up your team to focus on what matters most - your
                  people.
                </p>
                <ul className="space-y-4">
                  {[
                    "Automated onboarding and offboarding",
                    "Digital document management",
                    "Self-service employee portal",
                    "Customizable workflows",
                    "Integration with payroll systems",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8">Learn More</Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/20 to-green-500/20 rounded-xl blur-xl"></div>
                <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=500&width=600"
                    width={600}
                    height={500}
                    alt="HR Operations Dashboard"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by companies worldwide</h2>
            <p className="text-slate-600 text-lg">
              See what our customers have to say about how WorkForce has transformed their HR operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="WorkForce has completely transformed how we manage our team. The time tracking and performance analytics features have been game-changers for us."
              author="Sarah Johnson"
              role="HR Director, TechCorp"
              rating={5}
            />
            <TestimonialCard
              quote="The employee self-service portal has reduced our HR team's workload by 40%. Our employees love how easy it is to request time off and access their information."
              author="Michael Chen"
              role="CEO, Innovate Inc."
              rating={5}
            />
            <TestimonialCard
              quote="The compliance management tools have saved us countless hours and helped us avoid potential legal issues. WorkForce is an essential tool for our business."
              author="Emily Rodriguez"
              role="Operations Manager, Global Services"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-600 text-lg">
              Choose the plan that works best for your business. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Starter"
              price="$12"
              description="Perfect for small teams just getting started"
              features={[
                "Up to 25 employees",
                "Basic time tracking",
                "Employee profiles",
                "Standard reports",
                "Email support",
              ]}
              buttonText="Start Free Trial"
            />
            <PricingCard
              title="Professional"
              price="$29"
              description="Ideal for growing businesses with advanced needs"
              features={[
                "Up to 100 employees",
                "Advanced time tracking",
                "Performance analytics",
                "Custom workflows",
                "Priority support",
                "API access",
              ]}
              buttonText="Start Free Trial"
              highlighted={true}
            />
            <PricingCard
              title="Enterprise"
              price="$49"
              description="For large organizations with complex requirements"
              features={[
                "Unlimited employees",
                "Advanced analytics",
                "Compliance management",
                "Custom integrations",
                "Dedicated account manager",
                "SSO authentication",
                "SLA guarantees",
              ]}
              buttonText="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-lg">Find answers to common questions about WorkForce.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <FaqItem
              question="How does the 14-day free trial work?"
              answer="Our 14-day free trial gives you full access to all features of your selected plan. No credit card is required to start, and you can cancel anytime during the trial period with no obligation."
            />
            <FaqItem
              question="Can I switch plans later?"
              answer="Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new pricing will be prorated for the remainder of your billing cycle. If you downgrade, the new pricing will take effect at the start of your next billing cycle."
            />
            <FaqItem
              question="Is there a setup fee?"
              answer="No, there are no setup fees for any of our plans. You only pay the monthly or annual subscription fee for your selected plan."
            />
            <FaqItem
              question="Do you offer discounts for annual billing?"
              answer="Yes, we offer a 20% discount when you choose annual billing instead of monthly billing."
            />
            <FaqItem
              question="Can I import data from another system?"
              answer="Yes, WorkForce supports importing employee data from CSV files and direct integration with several popular HR systems. Our support team can assist with data migration if needed."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your workforce management?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of companies that trust WorkForce to manage their teams efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-blue-600 rounded-md rotate-45 transform origin-center"></div>
                <div className="absolute inset-1 bg-blue-500 rounded-sm rotate-45 transform origin-center"></div>
                <div className="absolute inset-2 bg-blue-400 rounded-sm rotate-45 transform origin-center"></div>
              </div>
              <span className="text-xl font-bold text-white">WorkForce</span>
            </div>
            <div className="text-sm">© {new Date().getFullYear()} WorkForce. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role, rating = 5 }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex text-amber-500 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-current" />
        ))}
      </div>
      <p className="text-slate-700 mb-6 italic">"{quote}"</p>
      <div>
        <div className="font-bold">{author}</div>
        <div className="text-sm text-slate-500">{role}</div>
      </div>
    </div>
  )
}

function PricingCard({ title, price, description, features, buttonText, highlighted = false }) {
  return (
    <div
      className={`bg-white rounded-xl border ${
        highlighted ? "border-blue-500 shadow-lg ring-1 ring-blue-500" : "border-slate-200 shadow-sm"
      } overflow-hidden h-full flex flex-col`}
    >
      {highlighted && <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">Most Popular</div>}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline mb-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-slate-500 ml-1">/month per user</span>
        </div>
        <p className="text-slate-600 mb-6">{description}</p>
        <Button className="w-full mb-6" variant={highlighted ? "default" : "outline"}>
          {buttonText}
        </Button>
        <div className="mt-auto">
          <p className="text-sm font-medium mb-2">Includes:</p>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold mb-2">{question}</h3>
      <p className="text-slate-600">{answer}</p>
    </div>
  )
}
