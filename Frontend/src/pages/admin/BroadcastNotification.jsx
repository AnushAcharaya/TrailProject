import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Send, AlertTriangle, Users, Stethoscope, Globe2, Bell, CheckCircle2, X } from "lucide-react";
import Layout from "../../components/Layout";
import { broadcastNotification } from "../../services/notificationApi";

const AUDIENCE_OPTIONS = [
  { value: "all", labelKey: "broadcast.audience.all", Icon: Globe2 },
  { value: "farmers", labelKey: "broadcast.audience.farmers", Icon: Users },
  { value: "vets", labelKey: "broadcast.audience.vets", Icon: Stethoscope },
];

const URGENCY_OPTIONS = [
  {
    value: "normal",
    labelKey: "broadcast.urgency.normal",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "ring-emerald-300",
    badge: "bg-emerald-500",
  },
  {
    value: "important",
    labelKey: "broadcast.urgency.important",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "ring-amber-300",
    badge: "bg-amber-500",
  },
  {
    value: "urgent",
    labelKey: "broadcast.urgency.urgent",
    pill: "bg-red-50 text-red-700 border-red-200",
    ring: "ring-red-400",
    badge: "bg-red-600",
  },
];

const BroadcastNotification = () => {
  const { t } = useTranslation("admin");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [urgency, setUrgency] = useState("normal");
  const [link, setLink] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultBanner, setResultBanner] = useState(null); // { type: 'success'|'error', text }

  const urgencyMeta = useMemo(
    () => URGENCY_OPTIONS.find((u) => u.value === urgency) ?? URGENCY_OPTIONS[0],
    [urgency]
  );

  const previewTitle = useMemo(() => {
    const prefix =
      urgency === "urgent" ? "🚨 URGENT: " : urgency === "important" ? "⚠️ Important: " : "";
    return prefix + (title || t("broadcast.preview.titlePlaceholder"));
  }, [urgency, title, t]);

  const audienceLabel = t(
    AUDIENCE_OPTIONS.find((a) => a.value === audience)?.labelKey || "broadcast.audience.all"
  );

  const canSubmit =
    title.trim().length > 0 && message.trim().length > 0 && !submitting;

  const handleSendClick = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setResultBanner(null);
    setConfirmOpen(true);
  };

  const confirmSend = async () => {
    setConfirmOpen(false);
    setSubmitting(true);

    const result = await broadcastNotification({
      title: title.trim(),
      message: message.trim(),
      audience,
      urgency,
      link: link.trim() || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      setResultBanner({
        type: "success",
        text: t("broadcast.result.success", { count: result.data.count }),
      });
      setTitle("");
      setMessage("");
      setLink("");
      setUrgency("normal");
      setAudience("all");
    } else {
      setResultBanner({
        type: "error",
        text:
          result.error?.error ||
          result.error?.message ||
          t("broadcast.result.failed"),
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Page header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-emerald-600 text-white p-3 rounded-xl">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("broadcast.title")}
            </h1>
            <p className="text-gray-600 mt-1">{t("broadcast.subtitle")}</p>
          </div>
        </div>

        {/* Result banner */}
        {resultBanner && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl mb-6 border ${
              resultBanner.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {resultBanner.type === "success" ? (
              <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{resultBanner.text}</p>
            <button
              onClick={() => setResultBanner(null)}
              className="ml-auto text-current opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <form
            onSubmit={handleSendClick}
            className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 space-y-6"
          >
            {/* Audience */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                {t("broadcast.fields.audience")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {AUDIENCE_OPTIONS.map(({ value, labelKey, Icon }) => {
                  const active = audience === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setAudience(value)}
                      className={`flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-all ${
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                          : "border-gray-200 hover:border-emerald-300 text-gray-700"
                      }`}
                    >
                      <Icon size={22} />
                      <span className="text-sm font-medium">
                        {t(labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                {t("broadcast.fields.urgency")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {URGENCY_OPTIONS.map(({ value, labelKey, pill, ring, badge }) => {
                  const active = urgency === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setUrgency(value)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${pill} ${
                        active ? `ring-2 ${ring}` : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${badge}`}></span>
                      <span className="text-sm font-semibold">{t(labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t("broadcast.fields.title")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder={t("broadcast.fields.titlePlaceholder")}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
              />
              <p className="text-xs text-gray-400 mt-1">
                {title.length}/200
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t("broadcast.fields.message")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                placeholder={t("broadcast.fields.messagePlaceholder")}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {message.length}/2000
              </p>
            </div>

            {/* Optional link */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {t("broadcast.fields.link")}
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={t("broadcast.fields.linkPlaceholder")}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
              />
              <p className="text-xs text-gray-400 mt-1">
                {t("broadcast.fields.linkHelp")}
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {t("broadcast.willSendTo")}: <span className="font-semibold">{audienceLabel}</span>
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                {submitting ? t("broadcast.sending") : t("broadcast.send")}
              </button>
            </div>
          </form>

          {/* Preview card */}
          <aside className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 h-fit lg:sticky lg:top-24">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={16} className="text-emerald-600" />
              {t("broadcast.preview.title")}
            </h3>

            <div
              className={`rounded-xl border p-4 ${
                urgency === "urgent"
                  ? "bg-red-50 border-red-200"
                  : urgency === "important"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${urgencyMeta.badge}`}></span>
                <span className="text-xs uppercase tracking-wide font-semibold text-gray-600">
                  {t("broadcast.preview.system")}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {t("broadcast.preview.justNow")}
                </span>
              </div>
              <p className="font-bold text-gray-900 text-sm leading-snug">
                {previewTitle}
              </p>
              <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
                {message || t("broadcast.preview.messagePlaceholder")}
              </p>
              {link && (
                <p className="text-xs text-emerald-700 mt-2 break-all">
                  → {link}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              {t("broadcast.preview.help")}
            </p>
          </aside>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`p-2 rounded-lg ${
                  urgency === "urgent"
                    ? "bg-red-100 text-red-700"
                    : urgency === "important"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t("broadcast.confirm.title")}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t("broadcast.confirm.body", { audience: audienceLabel })}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-5 text-sm">
              <p className="font-semibold text-gray-800">{previewTitle}</p>
              <p className="text-gray-600 mt-1 line-clamp-3">{message}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
              >
                {t("broadcast.confirm.cancel")}
              </button>
              <button
                onClick={confirmSend}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium inline-flex items-center gap-2"
              >
                <Send size={14} />
                {t("broadcast.confirm.send")}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BroadcastNotification;
