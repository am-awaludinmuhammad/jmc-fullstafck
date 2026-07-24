"use client"

import { useEffect, useState } from "react"
import { useRouter as useNextRouter } from "next/navigation"
import { Pencil, Plus, Search, Trash2, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

import { isValidUsername, isValidPassword, generateStrongPassword } from "@/lib/users/validate"

type Option = { id: number; name: string }

type ManagedUser = {
  id: number
  name: string
  username: string
  email: string | null
  cellphone: string | null
  status: "active" | "inactive"
  employeeId: number | null
  role: { id: number; name: string }
  employee: { id: number; name: string; nip: string; position: { name: string }; department: { name: string } } | null
}

type EmployeeOption = {
  id: number
  name: string
  nip: string
  position: { id: number; name: string }
  department: { id: number; name: string }
}

function UserFormDialog({
  trigger,
  roles,
  user,
}: {
  trigger: React.ReactNode
  roles: Option[]
  user?: ManagedUser
}) {
  const router = useNextRouter()
  const isEdit = Boolean(user)

  const [open, setOpen] = useState(false)

  const [employeeQuery, setEmployeeQuery] = useState(user?.employee?.name ?? "")
  const [employee, setEmployee] = useState<EmployeeOption | null>(
    user?.employee
      ? {
          id: user.employee.id,
          name: user.employee.name,
          nip: user.employee.nip,
          position: { id: 0, name: user.employee.position.name },
          department: { id: 0, name: user.employee.department.name },
        }
      : null
  )
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([])
  const [employeeOpen, setEmployeeOpen] = useState(false)

  const [username, setUsername] = useState(user?.username ?? "")
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [email, setEmail] = useState(user?.email ?? "")
  const [cellphone, setCellphone] = useState(user?.cellphone ?? "")
  const [roleId, setRoleId] = useState(user ? String(user.role.id) : "")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState(user ? user.status === "active" : true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const usernameFormatValid = username.length === 0 || isValidUsername(username)
  const passwordValid = password.length === 0 || isValidPassword(password)

  function resetForm() {
    setEmployeeQuery(user?.employee?.name ?? "")
    setEmployee(
      user?.employee
        ? {
            id: user.employee.id,
            name: user.employee.name,
            nip: user.employee.nip,
            position: { id: 0, name: user.employee.position.name },
            department: { id: 0, name: user.employee.department.name },
          }
        : null
    )
    setEmployeeOptions([])
    setUsername(user?.username ?? "")
    setUsernameAvailable(null)
    setEmail(user?.email ?? "")
    setCellphone(user?.cellphone ?? "")
    setRoleId(user ? String(user.role.id) : "")
    setPassword(isEdit ? "" : generateStrongPassword())
    setStatus(user ? user.status === "active" : true)
    setError("")
  }

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if ((employee && employeeQuery === employee.name) || employeeQuery.length < 2) {
        setEmployeeOptions([])
        return
      }

      const params = new URLSearchParams({ q: employeeQuery })
      if (isEdit) params.set("excludeUserId", String(user!.id))

      const response = await fetch(`/api/employees/search?${params.toString()}`)
      if (response.ok) {
        setEmployeeOptions(await response.json())
      }
    }, 300)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeQuery])

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!isValidUsername(username) || username === user?.username) {
        setUsernameAvailable(null)
        return
      }

      const params = new URLSearchParams({ username })
      if (isEdit) params.set("excludeUserId", String(user!.id))

      const response = await fetch(`/api/users/check-username?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setUsernameAvailable(data.available)
      }
    }, 300)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  function selectEmployee(option: EmployeeOption) {
    setEmployee(option)
    setEmployeeQuery(option.name)
    setEmployeeOpen(false)
    setEmployeeOptions([])
  }

  async function handleSave() {
    if (!employee || !username || !roleId || (!isEdit && !password)) {
      setError("Nama pengguna, username, role, dan password wajib diisi")
      return
    }

    if (!isValidUsername(username)) {
      setError("Username tidak memenuhi aturan")
      return
    }

    if (usernameAvailable === false) {
      setError("Username sudah dipakai")
      return
    }

    if (password && !isValidPassword(password)) {
      setError("Password tidak memenuhi aturan")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch(isEdit ? `/api/users/${user!.id}` : "/api/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          username,
          email,
          cellphone,
          roleId,
          password,
          status,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error ?? "Gagal menyimpan data")
        return
      }

      setOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) resetForm()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form Manajemen User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5 relative">
            <Label htmlFor="employee">Nama Pengguna</Label>
            <Input
              id="employee"
              type="text"
              autoComplete="off"
              placeholder="Ketik minimal 2 huruf, pilih dari data pegawai"
              value={employeeQuery}
              onChange={(e) => {
                setEmployeeQuery(e.target.value)
                setEmployee(null)
                setEmployeeOpen(true)
              }}
              onFocus={() => setEmployeeOpen(true)}
            />
            {employeeOpen && employeeOptions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-auto">
                {employeeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => selectEmployee(option)}
                  >
                    {option.name} — {option.nip}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Jabatan</Label>
              <Input type="text" value={employee?.position.name ?? ""} readOnly disabled />
            </div>
            <div className="grid gap-1.5">
              <Label>Departemen</Label>
              <Input type="text" value={employee?.department.name ?? ""} readOnly disabled />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="pr-8"
              />
              {username.length > 0 && usernameFormatValid && usernameAvailable !== null && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  {usernameAvailable ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <X className="size-4 text-destructive" />
                  )}
                </span>
              )}
            </div>
            {username.length > 0 && !usernameFormatValid && (
              <p className="text-xs text-destructive">
                Minimal 6 karakter, huruf kecil dan angka saja, tanpa spasi
              </p>
            )}
            {username.length > 0 && usernameFormatValid && usernameAvailable === false && (
              <p className="text-xs text-destructive">Username sudah dipakai</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cellphone">No HP</Label>
            <Input id="cellphone" type="text" value={cellphone} onChange={(e) => setCellphone(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih terlebih dahulu" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password{isEdit ? " (kosongkan jika tidak diubah)" : ""}</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password.length > 0 && !passwordValid && (
              <p className="text-xs text-destructive">
                Minimal 8 karakter, ada huruf besar, huruf kecil, karakter khusus, tanpa spasi
              </p>
            )}
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              onClick={() => setPassword(generateStrongPassword())}
            >
              Generate Password
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="status" checked={status} onCheckedChange={(checked) => setStatus(checked === true)} />
            <Label htmlFor="status" className="font-normal">Aktif</Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteUserAlert({ user }: { user: ManagedUser }) {
  const router = useNextRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/users/${user.id}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <button className="text-destructive hover:opacity-80">
              <Trash2 className="size-4" />
            </button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Hapus</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah kamu ingin menghapus user &quot;{user.name}&quot;?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ManajemenUserTable({
  users,
  roles,
}: {
  users: ManagedUser[]
  roles: Option[]
}) {
  const [search, setSearch] = useState("")

  const filtered = users.filter((item) =>
    `${item.name} ${item.username}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between gap-2 p-4 border-b flex-wrap">
        <h2 className="font-semibold">Manajemen User</h2>
        <UserFormDialog
          roles={roles}
          trigger={
            <Button>
              <Plus className="size-4" />
              Tambah
            </Button>
          }
        />
      </div>

      <div className="flex items-center gap-2 p-4 border-b flex-wrap justify-end">
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={String(role.id)}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari Data ..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">No</TableHead>
            <TableHead className="text-center w-16">Aksi</TableHead>
            <TableHead>Nama Pengguna</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Departemen</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 justify-center text-muted-foreground">
                  <UserFormDialog
                    roles={roles}
                    user={item}
                    trigger={
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="hover:text-foreground">
                            <Pencil className="size-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                    }
                  />

                  <DeleteUserAlert user={item} />
                </div>
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.username}</TableCell>
              <TableCell>{item.employee?.position.name ?? "-"}</TableCell>
              <TableCell>{item.employee?.department.name ?? "-"}</TableCell>
              <TableCell>{item.role.name}</TableCell>
              <TableCell>{item.status === "active" ? "Aktif" : "Tidak Aktif"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end p-4 border-t">
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
