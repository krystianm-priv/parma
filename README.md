# PARMA / Secretized

**PARMA** to system zarządzania sekretami oparty na pojedynczym pliku JSON, który łączy w sobie czytelność dla człowieka, walidację struktury oraz selektywne szyfrowanie wartości wrażliwych.

## 🎯 Idea Projektu

PARMA to **NIE** nowy format plików, **NIE** `.parma`, **NIE** `.enc`, **NIE** binarne bloki danych.

**To zwykły plik JSON**, zawsze zgodny z **jednym kanonicznym schematem JSON Schema**.

### Kluczowe Zasady

| Zasada | Znaczenie |
|--------|-----------|
| **Pojedynczy plik - źródło prawdy** | Wszystkie sekrety i metadane żyją razem; żadnego rozproszenia po zmiennych środowiskowych |
| **Czytelne metadane** | `kind`, `labels`, kategorie nadają znaczenie i dokumentują |
| **Selektywne szyfrowanie** | Nie wszystkie pola wymagają szyfrowania. Jawne wartości pozostają jawne |
| **Oparty na schemacie** | Gwarantuje poprawność struktury i zapobiega błędnym konfiguracjom |
| **Zero własnych kontenerów** | Żadnych `.parma`, `.secretize`, ani niestandardowych binarnych opakowań. To JSON, kropka |

## 📋 Przykład Struktury

```json
{
  "$schema": "https://gist.githubusercontent.com/.../v1.secretized-schema.json",
  "#version": 1,
  "#name": "MY_APP",

  "secrets": {
    "database": {
      "PASSWORD": {
        "kind": "encrypted",
        "value": "YmFzZTY0IGNpcGhlcnRleHQ="
      },
      "USER": {
        "kind": "plain",
        "value": "postgres"
      },
      "HOST": {
        "kind": "plain",
        "value": "localhost"
      }
    },
    "api": {
      "TOKEN": {
        "kind": "encrypted",
        "value": "ZW5jcnlwdGVkX3Rva2VuX2RhdGE=",
        "labels": ["production", "critical"]
      }
    }
  }
}
```

## 🔑 Model Definicji Sekretów

Każdy sekret to jeden z dwóch typów:

| Typ | Znaczenie | Zastosowanie |
|-----|-----------|--------------|
| `plain` | Niewrażliwy. Przechowywany bezpośrednio | np. kody regionów, nazwy użytkowników, flagi funkcji |
| `encrypted` | Wrażliwy. Zaszyfrowany kluczem współdzielonym | np. hasła, tokeny, klucze prywatne |

Każdy sekret może zawierać **labels** dla narzędzi, polityk rotacji itp.

## 🔐 Warstwa Szyfrowania

- **Algorytm**: AES-256-GCM
- **Klucz**: zawsze **32 surowe bajty**, zawsze **zakodowane w base64** gdy podawane
- **Szyfrowanie**: następuje **na poziomie wartości**, nie całego pliku

| Dane wejściowe | Dane wyjściowe |
|----------------|----------------|
| `value` (dowolny JSON) | serializacja → szyfrowanie → string base64 |
| Metadane (`kind`, labels, kategorie) | pozostawione jako plaintext |

Takie podejście **zachowuje audytowalność i przejrzystość** bez ujawniania zawartości sekretów.

## 🚀 Przepływ w Runtime

1. Wczytaj JSON
2. Zwaliduj względem schematu
3. Dla każdego sekretu:
   - Jeśli `kind = "plain"` → zwróć `value`
   - Jeśli `kind = "encrypted"` → odszyfruj `value` używając dostarczonego klucza AES
4. Wynikowa konfiguracja to **całkowicie normalny obiekt JS/Rust** tylko w pamięci

**Żadna odszyfrowana zawartość nigdy nie trafia na dysk.**

## 🔌 Źródła Kluczy (Adaptery)

PARMA **NIE zakłada skąd pochodzi klucz** — tylko że ma **32 bajty**.

System adapterów (plugowalnych) pozwala na różne źródła:

| Adapter | Status | Opis |
|---------|--------|------|
| **env** | planowany | Odczytuje `$<NAME>_SECRETIZED_KEY` ze zmiennych środowiskowych |
| **file** | przyszłość | Tylko lokalnie, zabezpieczony uprawnieniami |
| **TPM / DPAPI** | przyszłość | Magazyn kluczy chroniony przez system |
| **Hardware tokens** | przyszłość | Sprzętowe klucze USB |

## 📐 Walidacja i Konwencje Nazewnictwa

### Kluczowy wymóg:

```
#name musi być w formacie UPPER_CASE_WITH_UNDERSCORES
```

Dzięki temu można wyprowadzić:

```
<NAME>_SECRETIZED_KEY
```

jako kanoniczny **klucz zmiennej środowiskowej** do pobierania klucza AES.

To ujednolica:
- Użycie CLI
- Ładowanie w runtime
- Wstrzykiwanie w CI/CD
- Adaptery oparte na TPM lub plikach

## 💡 Dlaczego Ten Design Jest Ważny?

Świadomie **odrzuciliśmy szyfrowanie na poziomie pliku**, ponieważ:

❌ Uniemożliwia diffowanie  
❌ Niszczy możliwość przeglądania  
❌ Ukrywa metadane, które można bezpiecznie ujawnić  
❌ Burzy semantyczną czytelność

Nasz design zachowuje:

✅ Przyjazność dla git diff  
✅ Typowaną konfigurację  
✅ Edycję przez człowieka lub AI  
✅ Kompatybilność z przyszłymi narzędziami

## 📊 Podsumowanie Jedną Linią

**PARMA = Pojedynczy plik JSON walidowany schematem, gdzie sekrety są przechowywane jawnie lub zaszyfrowane AES-256-GCM na poziomie pola, z kluczem dostarczanym w runtime przez plugowalne adaptery.**

---

## 🛠️ Status Projektu

Projekt jest we wczesnej fazie rozwoju. Implementacja adapterów i narzędzi CLI jest w toku.

## 📄 Licencja

_Do ustalenia_

## 🤝 Kontakt

_Do ustalenia_