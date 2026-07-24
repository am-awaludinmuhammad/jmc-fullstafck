"use client"

import { useState } from "react"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"

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

import { dataUser } from "@/data/user"
import { roles } from "@/data/role"
import { positions, departments } from "@/data/master"

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

function UserFormDialog({ trigger }: { trigger: React.ReactNode }) {
  const [password, setPassword] = useState("")

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form Manajemen User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input id="nama" type="text" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" />
          </div>
          <div className="grid gap-1.5">
            <Label>Jabatan</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih terlebih dahulu" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Departemen</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih terlebih dahulu" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Role</Label>
            <Select>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-fit"
              onClick={() => setPassword(generatePassword())}
            >
              Generate Password
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="status" defaultChecked />
            <Label htmlFor="status" className="font-normal">Aktif</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ManajemenUserPage() {
  const [search, setSearch] = useState("")

  const filtered = dataUser.filter((item) =>
    `${item.employee.name} ${item.username}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between gap-2 p-4 border-b flex-wrap">
        <h2 className="font-semibold">Manajemen User</h2>
        <UserFormDialog
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
                          Apakah kamu ingin menghapus data ini?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
              <TableCell>{item.employee.name}</TableCell>
              <TableCell>{item.username}</TableCell>
              <TableCell>{item.employee.position.name}</TableCell>
              <TableCell>{item.employee.department.name}</TableCell>
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
