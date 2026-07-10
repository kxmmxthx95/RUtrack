import { Box } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

const swatches = [
  { name: "Primary", className: "bg-primary" },
  { name: "Secondary", className: "bg-secondary" },
  { name: "Accent", className: "bg-accent" },
  { name: "Muted", className: "bg-muted" },
  { name: "Destructive", className: "bg-destructive" },
  { name: "Border", className: "bg-border" },
  { name: "Card", className: "bg-card border" },
  { name: "Background", className: "bg-background border" },
]

function ThemeShowcase() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-lg bg-primary" />
          <div>
            <CardTitle className="text-2xl">Modern Minimal</CardTitle>
            <CardDescription>Inter · radius 0.375rem</CardDescription>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-normal">
          <Box className="size-4" /> shadcn/ui
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-8 pt-6 lg:grid-cols-[1fr_1fr_1fr]">
        <section>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Colors
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {swatches.map((s) => (
              <div key={s.name}>
                <div className={`h-12 rounded-md ${s.className}`} />
                <p className="mt-1.5 text-xs text-muted-foreground">{s.name}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="lg:border-l lg:pl-8">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Typography
          </h3>
          <p className="text-4xl font-bold">Heading</p>
          <p className="mt-2 text-xl text-muted-foreground">Subtitle text</p>
          <p className="mt-2 text-muted-foreground">Body copy and captions</p>
        </section>
        <section className="lg:border-l lg:pl-8">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Radius
          </h3>
          <div className="flex gap-4">
            <div className="size-12 rounded-none border-2 border-primary" />
            <div className="size-12 rounded-md border-2 border-primary" />
            <div className="size-12 rounded-xl border-2 border-primary" />
            <div className="size-12 rounded-full border-2 border-primary" />
          </div>
        </section>
        <section className="border-t pt-6 lg:col-span-3">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Components
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Error</Badge>
          </div>
          <div className="mt-6 grid items-end gap-8 lg:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="flex items-center gap-4">
              <Switch defaultChecked />
              <Checkbox defaultChecked />
              <span className="text-sm">Controls</span>
            </div>
            <div className="grid gap-5">
              <Progress value={70} />
              <Slider defaultValue={[45]} max={100} step={1} />
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

function ThemePreviewPage() {
  return (
    <div className="min-h-screen bg-muted/40 px-6 py-10">
      <main className="mx-auto max-w-6xl space-y-8">
        <ThemeShowcase />
        <section>
          <h2 className="mb-3 text-sm text-muted-foreground">Dashboard preview</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardDescription>Total Credits Earned</CardDescription>
                <CardTitle className="text-4xl">102 / 139</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={73} />
                <p className="mt-2 text-sm text-muted-foreground">
                  73% of degree requirements
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Enrolled This Semester</CardDescription>
                <CardTitle className="text-4xl">7 subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  21 credits · exam season in 6 weeks
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ThemePreviewPage
