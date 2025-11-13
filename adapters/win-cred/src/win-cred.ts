// @ts-nocheck @napi-ffi does not have proper types
import ffi from "@napi-ffi/ffi-napi";
import ref from "@napi-ffi/ref-napi";
import StructFactory from "@napi-ffi/ref-struct-di";

const Struct = StructFactory(ref);
const WCHAR = ref.types.uint16;
const LPWSTR = ref.refType(WCHAR);

const FILETIME = Struct({
  dwLowDateTime: ref.types.uint32,
  dwHighDateTime: ref.types.uint32,
});

const CREDENTIAL = Struct({
  Flags: ref.types.uint32,
  Type: ref.types.uint32,
  TargetName: LPWSTR,
  Comment: LPWSTR,
  LastWritten: FILETIME,
  CredentialBlobSize: ref.types.uint32,
  CredentialBlob: ref.refType(ref.types.void),
  Persist: ref.types.uint32,
  AttributeCount: ref.types.uint32,
  Attributes: ref.refType(ref.types.void),
  TargetAlias: LPWSTR,
  UserName: LPWSTR,
});

// WinAPI bindings
const advapi32 = ffi.Library("Advapi32", {
  CredWriteW: ["bool", [ref.refType(CREDENTIAL), "uint32"]],
  CredReadW: ["bool", ["pointer", "uint32", "uint32", "pointer"]],
  CredFree: ["void", ["pointer"]],
});

function toWide(str: string) {
  return Buffer.from(str + "\0", "ucs2");
}

export function addSecret(name: string, _value: string) {
  const cred = new CREDENTIAL();
  const value = Buffer.from(_value, "ucs2");

  cred.Flags = 0;
  cred.Type = 1; // CRED_TYPE_GENERIC
  cred.TargetName = toWide(name);
  cred.CredentialBlob = value;
  cred.CredentialBlobSize = value.length;
  cred.Persist = 2; // LOCAL_MACHINE
  cred.UserName = toWide("");

  const ok = advapi32.CredWriteW(cred.ref(), 0);
  if (!ok) throw new Error("CredWriteW failed");
}

// GET SECRET
export function getSecret(name: string): string {
  const nameBuf = toWide(name);

  const outPtr = Buffer.alloc(ref.sizeof.pointer);
  const ok = advapi32.CredReadW(nameBuf, 1, 0, outPtr);
  if (!ok) throw new Error("CredReadW failed");

  const credPtr = outPtr.readPointer(0);
  const credBuf = ref.reinterpret(credPtr, CREDENTIAL.size, 0);
  const cred = ref.get(credBuf, 0, CREDENTIAL);

  const blobPtr = cred.CredentialBlob;
  const blobSize = cred.CredentialBlobSize;
  const blob = ref.reinterpret(blobPtr, blobSize, 0);
  const value = Buffer.from(blob);

  advapi32.CredFree(credPtr);
  return value.toString("ucs2");
}
