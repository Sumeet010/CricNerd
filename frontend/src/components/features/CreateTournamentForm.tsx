import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";


import { Loader2, AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tournamentService } from "@/services";
import { ApiError } from "@/services/api";

// Must match the backend enums exactly
const PLAYING_FORMATS = ["5 Overs", "6 Overs", "20 Overs"] as const;
const PLAYING_STATUSES = ["UPCOMING", "ONGOING", "COMPLETED"] as const;

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  playingFormat: z.enum(PLAYING_FORMATS),
  playingStatus: z.enum(PLAYING_STATUSES).default("UPCOMING"),
});

interface CreateTournamentFormProps {
  onSuccess?: () => void;
}

export function CreateTournamentForm({ onSuccess }: CreateTournamentFormProps) {
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      playingFormat: "5 Overs",
      playingStatus: "UPCOMING",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setRootError(null);
    try {
      // Create tournament via API
      await tournamentService.create(values);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Failed to create tournament", error);
      
      if (error instanceof ApiError) {
        // ── 409: duplicate name → show under the name field ──
        // Backend returns: { message: "Tournament with this name already exist" }
        if (error.status === 409) {
          form.setError("name", {
            type: "server",
            message: error.message, // e.g. "Tournament with this name already exist"
          });

        // ── 400 with Zod issues → map each issue to its field ──
        } else if (error.zodErrors && Object.keys(error.zodErrors).length > 0) {
          Object.entries(error.zodErrors).forEach(([field, message]) => {
            form.setError(field as any, { type: "server", message });
          });

        // ── Everything else (date errors thrown as 500, 404, etc.) ──
        // Show the exact backend message in the top banner
        } else {
          setRootError(error.message || "An unexpected error occurred.");
        }
      } else {
        // Network / unknown failure
        setRootError("Could not reach the server. Check your connection.");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {rootError && (
          <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-700/60 text-red-300 text-sm px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{rootError}</span>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Tournament Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. TPL 2026" 
                  {...field} 
                  className="bg-zinc-900 border-zinc-800 text-white" 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Start Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="bg-zinc-900 border-zinc-800 text-white css-color-scheme-dark" 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">End Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="bg-zinc-900 border-zinc-800 text-white css-color-scheme-dark" 
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="playingFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Playing Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Select a format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {PLAYING_FORMATS.map((format) => (
                    <SelectItem key={format} value={format} className="focus:bg-zinc-800 focus:text-white">
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="playingStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {PLAYING_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="focus:bg-zinc-800 focus:text-white">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-[#fcf8e3] text-black hover:bg-[#f5eea5] font-semibold w-full sm:w-auto flex items-center gap-2 disabled:opacity-70"
          >
            {form.formState.isSubmitting && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {form.formState.isSubmitting ? "Creating..." : "Create Tournament"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
