import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Shield,
  UserPlus,
  UserX,
  Key,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Users,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import { credentialAPI, adminAPI } from "../api";
import { QuestionSkeleton } from "../components/ui/Skeleton";

const ROLES = [
  { value: "admin", label: "Admin", color: "text-red-600 bg-red-100 dark:bg-red-900/20" },
  { value: "moderator", label: "Moderator", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20" },
  { value: "mentor", label: "Mentor", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20" },
  { value: "ta", label: "TA", color: "text-green-600 bg-green-100 dark:bg-green-900/20" },
];

export default function CredentialManagement() {
  const queryClient = useQueryClient();
  const [issueEmail, setIssueEmail] = useState("");
  const [issueRole, setIssueRole] = useState("moderator");
  const [issueDuration, setIssueDuration] = useState("30d");
  const [issueReason, setIssueReason] = useState("");
  const [promoteEmail, setPromoteEmail] = useState("");

  const promoteMutation = useMutation({
    mutationFn: () => adminAPI.promoteToAdmin(promoteEmail),
    onSuccess: (data) => { toast.success(data.message || "User promoted"); setPromoteEmail(""); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to promote user"),
  });

  const { data: credentials, isLoading } = useQuery({
    queryKey: ["credentials"],
    queryFn: credentialAPI.list,
    refetchInterval: 30000,
  });

  const issueMutation = useMutation({
    mutationFn: () => credentialAPI.issue({
      email: issueEmail,
      role: issueRole,
      duration: issueDuration,
      reason: issueReason,
    }),
    onSuccess: () => {
      toast.success("Credential issued");
      setIssueEmail("");
      setIssueReason("");
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to issue credential"),
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => credentialAPI.revoke(id),
    onSuccess: () => {
      toast.success("Credential revoked");
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
    onError: () => toast.error("Failed to revoke credential"),
  });

  const getRoleInfo = (role) => ROLES.find((r) => r.value === role) || ROLES[0];
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <div className="min-h-screen relative">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credential Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {credentials?.length || 0} credentials issued
              </p>
            </div>
          </div>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ["credentials"] })}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue form */}
          <div className="card-glass p-5 h-fit sticky top-24">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" /> Promote to Admin
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">User email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={promoteEmail} onChange={(e) => setPromoteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <button onClick={() => promoteMutation.mutate()} disabled={!promoteEmail || promoteMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Award className="w-4 h-4" /> Promote to Admin
              </button>
            </div>
            <hr className="my-5 border-gray-200 dark:border-gray-700" />
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-emerald-500" /> Issue Credential
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={issueEmail} onChange={(e) => setIssueEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Role</label>
                <select value={issueRole} onChange={(e) => setIssueRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none">
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Duration</label>
                <select value={issueDuration} onChange={(e) => setIssueDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none">
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Reason (optional)</label>
                <textarea value={issueReason} onChange={(e) => setIssueReason(e.target.value)}
                  placeholder="Why is this credential being issued?"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm resize-none h-16 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button onClick={() => issueMutation.mutate()} disabled={!issueEmail || issueMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Key className="w-4 h-4" /> Issue Credential
              </button>
            </div>
          </div>

          {/* Credentials list */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <QuestionSkeleton />
            ) : credentials?.length === 0 ? (
              <div className="text-center py-16 card-glass">
                <Key className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No credentials issued</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Use the form to issue credentials</p>
              </div>
            ) : (
              <div className="space-y-2">
                {credentials?.map((cred) => {
                  const role = getRoleInfo(cred.role);
                  const isExpired = cred.expiresAt && new Date(cred.expiresAt) < new Date();
                  return (
                    <motion.div
                      key={cred._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white dark:bg-gray-800 rounded-xl border p-4 transition-shadow hover:shadow-md ${
                        !cred.isActive ? "border-red-200 dark:border-red-800 opacity-60" :
                        isExpired ? "border-amber-200 dark:border-amber-800" :
                        "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            !cred.isActive ? "bg-red-100 dark:bg-red-900/20" :
                            isExpired ? "bg-amber-100 dark:bg-amber-900/20" :
                            "bg-emerald-100 dark:bg-emerald-900/20"
                          }`}>
                            {!cred.isActive ? <XCircle className="w-5 h-5 text-red-500" /> :
                             isExpired ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                             <Shield className="w-5 h-5 text-emerald-500" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${role.color}`}>
                                {role.label}
                              </span>
                              {!cred.isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/20 text-red-500">Revoked</span>}
                              {isExpired && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/20 text-amber-500">Expired</span>}
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cred.email}</p>
                            {cred.reason && <p className="text-xs text-gray-500 mt-0.5">{cred.reason}</p>}
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Issued {formatDate(cred.createdAt)}</span>
                              {cred.expiresAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Expires {formatDate(cred.expiresAt)}</span>}
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />by {cred.grantedBy?.name || "Unknown"}</span>
                            </div>
                          </div>
                        </div>
                        {cred.isActive && !isExpired && (
                          <button onClick={() => { if (window.confirm(`Revoke ${role.label} credential for ${cred.email}?`)) revokeMutation.mutate(cred._id); }}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                            title="Revoke">
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

