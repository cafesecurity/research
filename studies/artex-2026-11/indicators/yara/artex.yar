/*
  ARTEX on disk: YARA rules from the study "ARTEX: what the code says" (artex-2026-11).

  What these find: a copy of ARTEX on systems you are responsible for (a checkout of its
  source, or a build of it), for example installed without permission or left on a
  compromised host. They do NOT detect an ARTEX attack against you: attacks run from the
  attacker's machines.

  Starting points. ARTEX_Source was tested against the four pinned source copies listed in
  claims.yaml (matches in all three ARTEX copies, none in the norma engine alone) and against
  unrelated repositories (no matches). ARTEX_Binary has NOT been tested on compiled files:
  the study builds and runs nothing. Forks can rename the module path and strings.

  Licence: MIT. Café Security Research. Claims: C010, C104, C184, C208, C217.
*/

rule ARTEX_Source
{
    meta:
        description = "ARTEX source code or Go module files (github.com/Autumn-27/artex and forks that keep its strings)"
        reference = "https://research.cafesecurity.com/artex/"
        study = "artex-2026-11"
        tested = "source copies v0.3.15, v0.3.30, FailSafe build fd6376c"
        date = "2026-11-26"
    strings:
        $mod     = "github.com/Autumn-27/artex"
        $engine  = "github.com/Autumn-27/norma"
        $rules   = "seedDefaultInterceptRulesV2"
        $ua_enr  = "artex-enrich/1.0"
        $ua_upd  = "artex-selfupdate"
        $health  = "\"service\": \"artex\""
        $prompt  = { E6 8E 88 E6 9D 83 E6 B8 97 E9 80 8F E6 B5 8B E8 AF 95 E7 B3 BB E7 BB 9F } // "authorised penetration-testing system", as written in the built-in prompts
    condition:
        filesize < 5MB and $mod and 1 of ($engine, $rules, $ua_enr, $ua_upd, $health, $prompt)
}

rule ARTEX_Binary
{
    meta:
        description = "Compiled ARTEX (ELF, PE or Mach-O) that keeps the module path and two more of its strings"
        reference = "https://research.cafesecurity.com/artex/"
        study = "artex-2026-11"
        tested = "not tested on binaries"
        date = "2026-11-26"
    strings:
        $mod     = "github.com/Autumn-27/artex"
        $engine  = "github.com/Autumn-27/norma"
        $rules   = "seedDefaultInterceptRulesV2"
        $ua_enr  = "artex-enrich/1.0"
        $ua_upd  = "artex-selfupdate"
        $prompt  = { E6 8E 88 E6 9D 83 E6 B8 97 E9 80 8F E6 B5 8B E8 AF 95 E7 B3 BB E7 BB 9F }
    condition:
        (uint32(0) == 0x464C457F or uint16(0) == 0x5A4D or uint32(0) == 0xFEEDFACF or uint32(0) == 0xCFFAEDFE)
        and $mod and 2 of ($engine, $rules, $ua_enr, $ua_upd, $prompt)
}
