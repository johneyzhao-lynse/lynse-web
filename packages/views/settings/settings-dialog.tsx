"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@lynse/ui/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@lynse/ui/components/ui/card";
import { Label } from "@lynse/ui/components/ui/label";
import { Input } from "@lynse/ui/components/ui/input";
import { Button } from "@lynse/ui/components/ui/button";
import { useAuthStore } from "@lynse/core/auth";
import { useTheme } from "@lynse/ui/components/common/theme-provider";
import { useTranslation } from "@lynse/core/i18n/react";
import { Sun, Moon, Monitor } from "../icons";
import { cn } from "@lynse/ui/lib/utils";

const DEFAULT_API_URL = "http://119.97.160.133:10060";

type ThemeOption = "light" | "dark" | "system";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themeOptions: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t("layout.theme_light"), icon: Sun },
    { value: "dark", label: t("layout.theme_dark"), icon: Moon },
    { value: "system", label: t("layout.theme_system"), icon: Monitor },
  ];

  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (open) {
      const savedUrl = localStorage.getItem("lynse_api_url");
      if (savedUrl) setApiUrl(savedUrl);
      const savedKey = localStorage.getItem("lynse_api_key");
      if (savedKey) setApiKey(savedKey);
    }
  }, [open]);

  async function handleConnect() {
    if (!apiKey.trim()) return;
    setError(null);
    setConnecting(true);
    try {
      await login(apiKey.trim(), apiUrl.trim());
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : t("settings.connection_failed");
      setError(message);
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    logout();
    setApiKey("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("nav.settings")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* ── Appearance ─────────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">{t("settings.appearance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="text-xs mb-2 block">{t("layout.theme")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const isActive = theme === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-2 text-xs font-medium transition-all",
                        isActive
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── API Configuration ──────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">{t("settings.api_config")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="dlg-api-url" className="text-xs">{t("settings.api_base_url")}</Label>
                <Input
                  id="dlg-api-url"
                  placeholder={DEFAULT_API_URL}
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="h-8 text-sm"
                  disabled={isAuthenticated}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dlg-api-key" className="text-xs">{t("settings.api_key")}</Label>
                <Input
                  id="dlg-api-key"
                  type="password"
                  placeholder="dk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-8 text-sm"
                  disabled={isAuthenticated}
                />
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    {t("settings.connected")}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={handleDisconnect}
                  >
                    {t("settings.disconnect")}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleConnect}
                  disabled={!apiKey.trim() || connecting}
                >
                  {connecting ? t("settings.connecting") : t("settings.connect")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
