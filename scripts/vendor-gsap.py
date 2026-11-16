"""Copy a pinned GSAP browser bundle after checking the npm archive integrity.

No package installation or package lifecycle scripts are run.
"""
import base64
import hashlib
import io
import json
from pathlib import Path
import tarfile
from urllib.request import urlopen

VERSION = "3.15.0"
ROOT = Path(__file__).resolve().parents[1]
with urlopen(f"https://registry.npmjs.org/gsap/{VERSION}", timeout=30) as response:
    metadata = json.load(response)
url = f"https://registry.npmjs.org/gsap/-/gsap-{VERSION}.tgz"
if metadata["dist"]["tarball"] != url:
    raise ValueError("Unexpected package source")
with urlopen(url, timeout=30) as response:
    archive = response.read()
integrity = "sha512-" + base64.b64encode(hashlib.sha512(archive).digest()).decode()
if integrity != metadata["dist"]["integrity"]:
    raise ValueError("GSAP archive integrity mismatch")

destination = ROOT / "dist" / "vendor"
destination.mkdir(exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as package:
    bundle = package.extractfile("package/dist/gsap.min.js").read()
    (destination / f"gsap-{VERSION}.min.js").write_bytes(bundle)
    # Copy only specifically named files; do not extract arbitrary archive paths.
    licenses = [name for name in package.getnames() if name.lower() in ("package/license", "package/license.md", "package/license.txt")]
    if licenses:
        (destination / "GSAP-LICENSE.txt").write_bytes(package.extractfile(licenses[0]).read())
    else:
        # GSAP distributes its license URL/copyright in the browser bundle header.
        notice = bundle[:bundle.index(b"*/") + 2].decode("utf-8")
        (destination / "GSAP-NOTICE.txt").write_text(notice + "\n", encoding="utf-8")

record = {
    "name": "gsap", "version": VERSION, "source": url,
    "archiveIntegrity": integrity,
    "bundleSHA256": hashlib.sha256(bundle).hexdigest(),
    "license": metadata.get("license"),
    "note": "Browser core bundle including CSSPlugin. No dependency installation or lifecycle scripts.",
}
(destination / "gsap-provenance.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"version": VERSION, "bytes": len(bundle), "sha256": record["bundleSHA256"], "licenseCopied": bool(licenses)}))
