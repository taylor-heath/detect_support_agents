{
  "$schema": "https://sicpadetect.internal/schemas/mdes-report-config/v2.json",
  "configId": "mdes-th-gambling",
  "version": "2.0.0",
  "generatedFrom": "MDES_DATA_REPORT_INSTRUCTIONS_v2.md",
  "jurisdiction": {
    "country": "TH",
    "authority": "Ministry of Digital Economy and Society",
    "premise": "All online gambling is illegal under Thai law; there is no licensing route.",
    "forbiddenVocabulary": [
      "illegal",
      "licensed",
      "unlicensed"
    ],
    "forbiddenVocabularyScope": "classification axes, labels, chart series, column headers, metric names"
  },
  "input": {
    "format": "csv",
    "delimiter": ";",
    "encoding": "utf-8",
    "encodingFailure": "If Thai characters arrive mojibaked, stop and report an encoding failure. Do not proceed with a lexicon that cannot match.",
    "trimHeaders": true,
    "skipEmptyLines": true,
    "requiredColumns": [
      "Domain",
      "URL",
      "Status",
      "Source",
      "Rank",
      "Updated at",
      "Confidence",
      "LLM Reasoning",
      "Case Management Status"
    ],
    "optionalColumns": {
      "legalEntity": [
        "Legal entity",
        "Legal Entity",
        "Legal entity name",
        "Entity",
        "Operator",
        "Operator name"
      ],
      "legalEntityCountry": [
        "Legal entity country",
        "Legal Entity Country",
        "Entity country",
        "Operator country",
        "Jurisdiction"
      ],
      "extraEvidence": [
        "Interesting Keywords",
        "Remarks"
      ]
    },
    "onMissingRequiredColumn": "stop and report exactly which are missing",
    "statusNormalisation": {
      "Illegal gambling": "Gambling",
      "Licensed gambling": "Gambling",
      "Gambling": "Gambling",
      "yes": "Gambling",
      "Not gambling": "Not gambling",
      "no": "Not gambling",
      "Unreachable": "Unreachable",
      "Cannot locate": "Unreachable",
      "Review needed": "Review needed",
      "*": "Unknown"
    },
    "auditCounters": [
      {
        "name": "normalisedFromLicensed",
        "description": "rows arriving as 'Licensed gambling'",
        "report": "footnote only; a data-quality signal about the upstream classifier, not a finding"
      }
    ]
  },
  "workingSet": {
    "name": "standard",
    "steps": [
      {
        "op": "drop",
        "where": "normalisedStatus == 'Review needed'"
      },
      {
        "op": "deduplicate",
        "by": "URL",
        "keep": "first",
        "note": "rows with no URL are kept and keyed by their whole content"
      }
    ],
    "derived": {
      "total": "row count of the standard set",
      "label": "Domain if non-empty else URL",
      "suffix": "last dot-segment of Domain; '(unknown)' if no dot",
      "sourceCategory": {
        "Manual": "prefix 'Manual'",
        "Google Search": "prefix 'Google Search'",
        "Variant": "prefix 'Variant'",
        "Redirect": "prefix 'Redirect'",
        "Other": "fallback"
      },
      "seed": "text inside the first parentheses of Source, else empty",
      "isGambling": "normalisedStatus == 'Gambling'",
      "evidenceText": {
        "fields": [
          "LLM Reasoning",
          "Interesting Keywords",
          "Remarks",
          "URL",
          "Domain"
        ],
        "join": " ",
        "casePolicy": "preserve original case and Thai characters; lowercase only a parallel copy used for Latin matching"
      }
    }
  },
  "lexicon": {
    "matchRules": {
      "substring": {
        "appliesTo": [
          "thai",
          "mixed"
        ],
        "caseSensitive": true,
        "rationale": "Thai has no word delimiters, so no boundary test is possible"
      },
      "token_boundary": {
        "appliesTo": [
          "latin"
        ],
        "caseSensitive": false,
        "boundary": "[^a-z0-9] or string edge on both sides",
        "rationale": "stops BET matching 'betterment' and WIN matching 'winter'"
      },
      "short_abbreviation": {
        "appliesTo": [
          "AE",
          "AG",
          "FC",
          "PG",
          "PP",
          "SA",
          "WM",
          "XO"
        ],
        "rule": "counts only when the token stands alone or sits adjacent to a separator inside a domain stem (pg-slot, slotxo, /pg/)",
        "excludes": "bare occurrence inside running prose",
        "monitor": {
          "metric": "share of all Abbreviations matches attributable to one term",
          "threshold": 0.2,
          "action": "flag in the methodology footnote as a probable false-positive source"
        }
      },
      "hashtag": {
        "appliesTo": [
          "hashtag"
        ],
        "rule": "match the full string including '#', then strip '#' and re-run the remainder against product tabs",
        "effect": "always adds the Hashtags signal tag; may also contribute a product score"
      }
    },
    "collisions": [
      {
        "term": "คาสิโน",
        "tabs": [
          "General Gambling",
          "Casino"
        ],
        "resolveTo": "Casino",
        "note": "specific product tab wins over the catch-all"
      },
      {
        "term": "คาสิโนออนไลน์",
        "tabs": [
          "General Gambling",
          "Casino"
        ],
        "resolveTo": "Casino",
        "note": "specific product tab wins over the catch-all"
      },
      {
        "term": "พนันกีฬา",
        "tabs": [
          "General Gambling",
          "Football Betting"
        ],
        "resolveTo": "Football Betting",
        "note": "specific product tab wins over the catch-all"
      },
      {
        "term": "พนันบอล",
        "tabs": [
          "General Gambling",
          "Football Betting"
        ],
        "resolveTo": "Football Betting",
        "note": "specific product tab wins over the catch-all"
      },
      {
        "term": "แทงบอล",
        "tabs": [
          "General Gambling",
          "Football Betting"
        ],
        "resolveTo": "Football Betting",
        "note": "specific product tab wins over the catch-all"
      }
    ],
    "categories": [
      {
        "id": "general_gambling",
        "tab": "General Gambling",
        "axis": "product",
        "keywordCount": 22,
        "keywords": [
          {
            "term": "พนัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "การพนัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "พนันออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บพนัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บเดิมพัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เดิมพัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เดิมพันออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "คาสิโน",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "Casino"
            ]
          },
          {
            "term": "คาสิโนออนไลน์",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "Casino"
            ]
          },
          {
            "term": "บ่อน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บ่อนออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บเกมพนัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมพนัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บเสี่ยงโชค",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เสี่ยงโชค",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บเกมเงิน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เล่นเงินจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมได้เงินจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เดิมพันกีฬา",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "พนันกีฬา",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "Football Betting"
            ]
          },
          {
            "term": "พนันบอล",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "Football Betting"
            ]
          },
          {
            "term": "แทงบอล",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "Football Betting"
            ]
          }
        ],
        "priority": 1,
        "eligibleAsSubcategory": true,
        "role": "catch-all; eligible only when no priority-2 tab scores"
      },
      {
        "id": "football_betting",
        "tab": "Football Betting",
        "axis": "product",
        "keywordCount": 21,
        "keywords": [
          {
            "term": "พนันบอล",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "General Gambling"
            ]
          },
          {
            "term": "พนันบอลออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แทงบอล",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "General Gambling"
            ]
          },
          {
            "term": "แทงบอลออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "พนันฟุตบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แทงฟุตบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สปอร์ตบุ๊ค",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บอลออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ราคาบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บอลสเต็ป",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บอลเดี่ยว",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สเต็ปบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แทงบอลชุด",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ทีเด็ดบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "วิเคราะห์บอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โต๊ะบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ล้มโต๊ะบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เดิมพันฟุตบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บแทงบอล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บอลสเต็ปแม่น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "พนันกีฬา",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "General Gambling"
            ]
          }
        ],
        "priority": 2,
        "eligibleAsSubcategory": true
      },
      {
        "id": "casino",
        "tab": "Casino",
        "axis": "product",
        "keywordCount": 14,
        "keywords": [
          {
            "term": "คาสิโน",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "General Gambling"
            ]
          },
          {
            "term": "คาสิโนออนไลน์",
            "script": "thai",
            "match": "substring",
            "alsoIn": [
              "General Gambling"
            ]
          },
          {
            "term": "คาสิโนสด",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "คาสิโนสดออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เสือมังกร",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รูเล็ต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รูเล็ตออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รูเล๊ต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ไฮโล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ไฮโลออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ไฮโลไทย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หมุนวงล้อโบนันซ่ารายวัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หมุนวงล้อโบนันซ่า",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ปั่นแปะ",
            "script": "thai",
            "match": "substring"
          }
        ],
        "priority": 2,
        "eligibleAsSubcategory": true
      },
      {
        "id": "slots",
        "tab": "Slots",
        "axis": "product",
        "keywordCount": 32,
        "keywords": [
          {
            "term": "สล็อต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมสล็อต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมสล็อตออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตแตกง่าย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตแตกบ่อย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตแตกหนัก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตแตกจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตใหม่",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตเว็บตรง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตวอเลท",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เล่นสล็อต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตเครดิตฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตแตกทุกวัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตมาแรง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตยอดนิยม",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตค่ายดัง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตไม่ผ่านเอเย่นต์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อต pg",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "สล็อต joker",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "สล็อต jili",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "สล็อต pragmatic",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "สล็อต xo",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "สล็อต auto",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "สล็อตแตกไว",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตฝากถอนออโต้",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตฝากไม่มีขั้นต่ำ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตโบนัสแตกหนัก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตสายฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อตปั่นง่าย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สล็อต RTP สูง",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "สล็อตคืนกำไร",
            "script": "thai",
            "match": "substring"
          }
        ],
        "priority": 2,
        "eligibleAsSubcategory": true
      },
      {
        "id": "playing_card",
        "tab": "Playing card",
        "axis": "product",
        "keywordCount": 12,
        "keywords": [
          {
            "term": "ไพ่",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ไพ่ออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ไพ่ ออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ไพ่ป๊อก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ป๊อกเด้ง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ป๊อกเด้งออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แบล็คแจ็ค",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แบล็คแจ็คออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โป๊กเกอร์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โป๊กเกอร์ออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ตีไก่สองใบ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ตีไก่สามใบ",
            "script": "thai",
            "match": "substring"
          }
        ],
        "priority": 2,
        "eligibleAsSubcategory": true
      },
      {
        "id": "baccarat",
        "tab": "Baccarat",
        "axis": "product",
        "keywordCount": 11,
        "keywords": [
          {
            "term": "บาคารา",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บาคาร่า",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บาคาร่าออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ไพ่บาคาร่า",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บาคาร่าสด",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โต๊ะบาคาร่า",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บาคาร่าทดลอง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บาคาร่าฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "บาคาร่าระบบ AI",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "บาคาร่าขั้นเทพ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สูตรบาคาร่า",
            "script": "thai",
            "match": "substring"
          }
        ],
        "priority": 2,
        "eligibleAsSubcategory": true
      },
      {
        "id": "lottery",
        "tab": "Lottery",
        "axis": "product",
        "keywordCount": 20,
        "keywords": [
          {
            "term": "หวยออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แทงหวย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ซื้อหวยออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยยี่กี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยฮานอย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยลาว",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยรัฐบาล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยมาเลย์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยจับยี่กี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "จับยี่กี VIP",
            "script": "mixed",
            "match": "substring"
          },
          {
            "term": "หวยใต้ดิน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยออนไลน์จ่ายจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บหวย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บแทงหวย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "Huay",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "Huaylan",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "หวยหุ้น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยหุ้นไทย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยหุ้นต่างประเทศ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หวยชุด",
            "script": "thai",
            "match": "substring"
          }
        ],
        "priority": 2,
        "eligibleAsSubcategory": true
      },
      {
        "id": "deposit_withdrawal",
        "tab": "Deposit & Withdrawal",
        "axis": "signal",
        "keywordCount": 24,
        "keywords": [
          {
            "term": "ฝากถอนออโต้",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ฝากถอนอัตโนมัติ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ฝากถอนเร็ว",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ฝากไว",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ถอนจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ถอนเร็ว",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ถอนไม่อั้น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ถอนทุกวัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ฝากไม่มีขั้นต่ำ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ถอนไม่มีขั้นต่ำ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ฝาก 1 บาท",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ฝาก 10 บาท",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ฝากเริ่มต้น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ถอนภายใน 1 นาที",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ถอนภายใน 30 วินาที",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ฝากผ่านวอเลท",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "Wallet",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "ทรูวอลเล็ต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "วอลเล็ต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "พร้อมเพย์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ระบบออโต้",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ระบบอัตโนมัติ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "อัตราการจ่าย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เรทการจ่าย",
            "script": "thai",
            "match": "substring"
          }
        ],
        "eligibleAsSubcategory": false,
        "indicates": "Payment and cash-out mechanics advertised"
      },
      {
        "id": "promotions",
        "tab": "Promotions",
        "axis": "signal",
        "keywordCount": 27,
        "keywords": [
          {
            "term": "เครดิตฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รับเครดิตฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เครดิตฟรีไม่ต้องฝาก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เครดิตฟรีกดรับเอง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แจกเครดิตฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสสมาชิกใหม่",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสแรกเข้า",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสต้อนรับ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสแตกหนัก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัส 100%",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โปรสมาชิกใหม่",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โปรฝากแรก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โปรถอนจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โปรคืนยอดเสีย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "คืนยอดเสีย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสรายวัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสรายสัปดาห์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสรายเดือน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสแนะนำเพื่อน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โบนัสชวนเพื่อน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โปรคุ้ม",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โปรแรง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โปรเด็ด",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "โปรพิเศษ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ของแถม",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "กิจกรรมแจกเครดิต",
            "script": "thai",
            "match": "substring"
          }
        ],
        "eligibleAsSubcategory": false,
        "indicates": "Free-credit and bonus acquisition offers"
      },
      {
        "id": "marketing_acquisition",
        "tab": "Marketing & Acquisition",
        "axis": "signal",
        "keywordCount": 25,
        "keywords": [
          {
            "term": "แตกหนัก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แตกจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แตกไม่อั้น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "แตกทุกวัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ทำกำไร",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "กำไรวันละ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รายได้เสริม",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รายได้พิเศษ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สร้างรายได้",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ได้เงินจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ถอนเงินจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รวยจากมือถือ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เล่นง่าย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ได้จริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "จ่ายจริง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "จ่ายหนัก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เข้ากลุ่มฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รับยูสฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สมัครฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สมัครรับโบนัส",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สมัครสมาชิก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สมัครวันนี้",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ลุ้นรางวัล",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สมาชิกใหม่",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รับทุนฟรี",
            "script": "thai",
            "match": "substring"
          }
        ],
        "eligibleAsSubcategory": false,
        "indicates": "Win-rate and payout claims"
      },
      {
        "id": "affiliate_agent",
        "tab": "Affiliate & Agent",
        "axis": "signal",
        "keywordCount": 20,
        "keywords": [
          {
            "term": "เอเย่นต์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "Agent",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "Affiliate",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "ตัวแทน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "นายหน้า",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ดีลเลอร์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รับตัวแทน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เปิดยูสเซอร์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รับคนเล่น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สายงานพนัน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ระบบแนะนำเพื่อน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ค่าคอม",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "คอมมิชชั่น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รายได้จากการแนะนำ",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รับสมัครพาร์ทเนอร์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "Partner",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "แชร์รายได้",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "หารายได้ออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รายได้ไม่จำกัด",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ดีลเลอร์สด",
            "script": "thai",
            "match": "substring"
          }
        ],
        "eligibleAsSubcategory": false,
        "indicates": "Affiliate, agent or referral structure"
      },
      {
        "id": "vague_evasion",
        "tab": "Vague-Evasion Terms",
        "axis": "signal",
        "keywordCount": 20,
        "keywords": [
          {
            "term": "เกมทำเงิน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมออนไลน์ทำเงิน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมเศรษฐีออนไลน์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ค่ายเกมดัง",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมโบนัสแตก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมทุนน้อย",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมสร้างรายได้",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บทำเงิน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เว็บรายได้เสริม",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมปั่นเครดิต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ปั่นทุน",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ปั่นกำไร",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ปั่นเครดิต",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "รับทุนเล่น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เล่นรับทรัพย์",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สายปั่น",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สายทำกำไร",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "สายฟรี",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "ปั่นแตก",
            "script": "thai",
            "match": "substring"
          },
          {
            "term": "เกมแตกง่าย",
            "script": "thai",
            "match": "substring"
          }
        ],
        "eligibleAsSubcategory": false,
        "indicates": "Deliberate avoidance of explicit gambling vocabulary"
      },
      {
        "id": "abbreviations",
        "tab": "Abbreviations",
        "axis": "signal",
        "keywordCount": 22,
        "keywords": [
          {
            "term": "PG",
            "script": "latin",
            "match": "short_abbreviation",
            "falsePositiveRisk": "high"
          },
          {
            "term": "PGSOFT",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "PP",
            "script": "latin",
            "match": "short_abbreviation",
            "falsePositiveRisk": "high"
          },
          {
            "term": "PRAGMATIC",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "JILI",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "JDB",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "FC",
            "script": "latin",
            "match": "short_abbreviation",
            "falsePositiveRisk": "high"
          },
          {
            "term": "SLOTXO",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "XO",
            "script": "latin",
            "match": "short_abbreviation",
            "falsePositiveRisk": "high"
          },
          {
            "term": "SA",
            "script": "latin",
            "match": "short_abbreviation",
            "falsePositiveRisk": "high"
          },
          {
            "term": "SEXY",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "WM",
            "script": "latin",
            "match": "short_abbreviation",
            "falsePositiveRisk": "high"
          },
          {
            "term": "AG",
            "script": "latin",
            "match": "short_abbreviation",
            "falsePositiveRisk": "high"
          },
          {
            "term": "AE",
            "script": "latin",
            "match": "short_abbreviation",
            "falsePositiveRisk": "high"
          },
          {
            "term": "M8BET",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "BET",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "WIN",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "VIP",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "AUTO",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "RTP",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "WALLET",
            "script": "latin",
            "match": "token_boundary"
          },
          {
            "term": "TRUEWALLET",
            "script": "latin",
            "match": "token_boundary"
          }
        ],
        "eligibleAsSubcategory": false,
        "indicates": "Provider or network branding"
      },
      {
        "id": "hashtags",
        "tab": "Hashtags",
        "axis": "signal",
        "keywordCount": 21,
        "keywords": [
          {
            "term": "#สล็อต",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#สล็อตแตกง่าย",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#สล็อตเว็บตรง",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#สล็อตออนไลน์",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#สล็อตแตกหนัก",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#เครดิตฟรี",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#บาคาร่า",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#บาคาร่าออนไลน์",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#คาสิโนออนไลน์",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#พนันบอล",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#แทงบอล",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#เว็บพนัน",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#เว็บตรง",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#เว็บตรงไม่ผ่านเอเย่นต์",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#เล่นสล็อต",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#แตกง่าย",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#แตกหนัก",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#ถอนจริง",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#ฝากถอนออโต้",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#สล็อตวอเลท",
            "script": "hashtag",
            "match": "hashtag"
          },
          {
            "term": "#สล็อตpg",
            "script": "hashtag",
            "match": "hashtag"
          }
        ],
        "eligibleAsSubcategory": false,
        "indicates": "Promoted through hashtag campaigns"
      }
    ]
  },
  "classification": {
    "appliesTo": "every row in the standard set",
    "nonGambling": {
      "condition": "normalisedStatus != 'Gambling'",
      "assign": {
        "subcategory": "Not applicable",
        "subcategoryMethod": "n/a",
        "signalTags": []
      },
      "note": "Do not force non-gambling rows into a product bucket even if a keyword matches."
    },
    "keywordPass": {
      "steps": [
        {
          "step": 1,
          "op": "match all lexicon keywords against evidenceText, recording tab, term and location"
        },
        {
          "step": 2,
          "op": "signalTags = every signal tab with >= 1 match; store matched terms in signalKeywords"
        },
        {
          "step": 3,
          "op": "productScore[tab] = count of distinct keywords matched from that tab, for priority-2 tabs only"
        },
        {
          "step": 4,
          "op": "exactly one priority-2 tab scores > 0",
          "assign": {
            "method": "keyword",
            "confidence": "high"
          }
        },
        {
          "step": 5,
          "op": "several priority-2 tabs score > 0 -> highest score wins",
          "tieBreak": [
            "more distinct keywords matched",
            "a match in Domain or URL beats one in reasoning text",
            "longer keyword wins (บาคาร่าออนไลน์ is more specific than คาสิโน)",
            "tab order as listed in lexicon.categories"
          ],
          "record": "subcategoryAlternatives = every scoring tab",
          "confidence": "high if top score >= 2x runner-up, else medium"
        },
        {
          "step": 6,
          "op": "no priority-2 tab scores but General Gambling does",
          "assign": {
            "subcategory": "general_gambling",
            "method": "keyword",
            "confidence": "medium"
          },
          "meaning": "confirmed gambling, product type not evidenced"
        },
        {
          "step": 7,
          "op": "no product tab scores at all",
          "goto": "reasoningPass"
        }
      ],
      "note": "A site can score zero on product tabs and still carry several signal tags. The vague-evasion case is exactly this: it goes to reasoningPass for the product judgement while keeping its tags."
    },
    "reasoningPass": {
      "trigger": "no product tab matched",
      "input": "LLM Reasoning",
      "task": "Read what the model described the site as offering and place it in the closest product tab.",
      "constraints": [
        {
          "id": 1,
          "rule": "Choose only from the seven product tabs. Never invent a subcategory and never assign a signal tab as the subcategory."
        },
        {
          "id": 2,
          "rule": "Judge on the described game or product offering, not on branding, layout or tone."
        },
        {
          "id": 3,
          "rule": "If several offerings are described, choose the one treated as primary; record the rest in subcategoryAlternatives."
        },
        {
          "id": 4,
          "rule": "If gambling is confirmed but no specific product is named, assign general_gambling. This is the correct answer, not a failure — do not guess at a product."
        },
        {
          "id": 5,
          "rule": "If the site lists or links to other gambling sites rather than operating games, assign general_gambling and add the affiliate_agent signal tag."
        },
        {
          "id": 6,
          "rule": "If LLM Reasoning is empty, assign 'Unspecified'. Do not infer from the domain name alone."
        },
        {
          "id": 7,
          "rule": "Set subcategoryMethod = 'inferred' and subcategoryConfidence = 'low'."
        },
        {
          "id": 8,
          "rule": "Write a one-sentence subcategoryBasis paraphrasing the phrase that drove the choice, so a reviewer can audit it."
        }
      ]
    },
    "emittedFields": [
      "subcategory",
      "subcategoryMethod",
      "subcategoryConfidence",
      "subcategoryMatchedKeywords",
      "subcategoryAlternatives",
      "subcategoryBasis",
      "signalTags",
      "signalKeywords"
    ],
    "qualityMetrics": [
      {
        "name": "inferredShare",
        "formula": "inferred rows / gambling rows * 100",
        "threshold": 30,
        "onExceed": "state plainly that the lexicon has poor coverage of this dataset and that subcategory figures are indicative only"
      },
      {
        "name": "generalShare",
        "formula": "rows assigned general_gambling / gambling rows * 100",
        "threshold": 40,
        "onExceed": "same disclosure; name the tabs with the weakest coverage"
      },
      {
        "name": "keywordsNeverMatched",
        "formula": "lexicon entries with zero hits, listed per tab"
      }
    ],
    "coverageWarning": "A predominantly Thai lexicon run against Latin-script or transliterated domains will trip both thresholds. Say so rather than presenting thin figures confidently."
  },
  "clustering": {
    "purpose": "collapse many domains onto the operator behind them",
    "stem": {
      "steps": [
        "take label, lowercase, strip scheme and path",
        "strip leading www. m. mobile. th. app.",
        "drop the public suffix",
        "repeatedly strip trailing affixes: th, thai, aff, affiliate, vip, official, v\\d+, \\d+",
        "strip separators - _ .",
        "if the result is under 3 characters, revert to the value before affix stripping"
      ],
      "example": {
        "input": "https://www.siam855thb5.com/x",
        "output": "siam"
      },
      "revertExample": {
        "input": "i828thv1",
        "naive": "i",
        "output": "i828thv1"
      }
    },
    "rules": [
      {
        "id": 1,
        "rule": "Variant and Redirect rows with a non-empty seed join the cluster of stem(seed). Seed linkage always wins — it is asserted by the crawler, not inferred."
      },
      {
        "id": 2,
        "rule": "Otherwise group rows sharing an identical stem."
      },
      {
        "id": 3,
        "rule": "Near-miss merge when Jaro-Winkler >= 0.90 AND one stem is a prefix of the other or they differ only in trailing characters.",
        "threshold": 0.9,
        "example": "dafabet + dafawining -> dafa",
        "never": "merge below 0.90"
      },
      {
        "id": 4,
        "rule": "A cluster's name is its shortest member stem."
      },
      {
        "id": 5,
        "rule": "A stem occurring once and never merged is a singleton."
      }
    ],
    "clusterRecord": [
      "name",
      "urlCount",
      "domains",
      "suffixes",
      "sources",
      "subcategories",
      "signalTags",
      "seedLinked",
      "mergeBasis",
      "firstSeen",
      "lastSeen"
    ],
    "mergeBasisValues": [
      "seed",
      "stem",
      "similarity"
    ],
    "signalCorroboration": {
      "metric": "Jaccard similarity of signalKeywords sets between each pair of multi-URL clusters",
      "threshold": 0.6,
      "output": "Possible operator linkage table: cluster A / cluster B / shared keywords / Jaccard",
      "doNotMerge": true,
      "rationale": "shared promotional vocabulary is common across unrelated operators using the same affiliate templates; this is a lead for an analyst, not a clustering decision",
      "label": "indicative"
    },
    "metrics": [
      "distinctClusters",
      "multiUrlClusters",
      "singletonCount",
      "top5Share",
      "top10Share",
      "clustersToHalf",
      "crossSubcategoryClusters",
      "tldRotationClusters",
      "topCluster",
      "topClusterDomains"
    ]
  },
  "metrics": {
    "counts": [
      "total",
      "gambling",
      "notGambling",
      "unreachable",
      "unknown",
      {
        "gamblingShare": "gambling / total * 100"
      }
    ],
    "period": {
      "parse": "Updated at",
      "ignoreUnparseable": true,
      "earliest": "min",
      "latest": "max",
      "dateFormat": "YYYY-MM-DD",
      "days": "round((latest - earliest)/1 day) + 1, else 0",
      "series": "distinct URLs updated per date, ascending {date, count}"
    },
    "statusDistribution": "{status, count, pct = count/total*100} sorted desc",
    "subcategoryDistribution": {
      "scope": "gambling rows only",
      "fields": [
        "subcategory",
        "count",
        "pct = count/gambling*100",
        "keywordAssigned",
        "inferredAssigned",
        "distinctClusters"
      ],
      "methodSplit": "{subcategory, keyword, inferred}"
    },
    "signalTagDistribution": {
      "scope": "gambling rows only",
      "fields": [
        "tag",
        "count",
        "pct = count/gambling*100"
      ],
      "extra": {
        "tagsPerSite": "mean number of tags per gambling row"
      }
    },
    "keywordFrequency": {
      "scope": "gambling rows only",
      "fields": [
        "keyword",
        "tab",
        "count",
        "pct = count/gambling*100"
      ],
      "sort": "count desc",
      "keepForHeatMap": 25,
      "extra": [
        "distinctKeywordsMatched",
        "keywordsNeverMatched"
      ]
    },
    "suffixes": {
      "groupBy": "suffix(Domain)",
      "top": 10,
      "fields": [
        "total",
        "pct = total/all*100",
        "gambling",
        "pctGambling = gambling/total*100"
      ]
    },
    "structure": {
      "scope": "gambling rows only",
      "split": [
        "variantRows",
        "redirectRows",
        "directRows"
      ],
      "asPctOf": "their sum",
      "redirects": {
        "groupBy": "seed",
        "count": "distinct URLs",
        "top": 10,
        "topRedirectTargets": 40
      }
    },
    "namingConventions": {
      "tokens": [
        "mobile",
        "m.",
        "account",
        "login",
        "secure",
        "verify",
        "support",
        "app",
        "bet",
        "casino",
        "win",
        "play",
        "th",
        "thai",
        "aff",
        "vip",
        "slot",
        "pg"
      ],
      "bullets": [
        "top 3 recurring tokens with counts, phrased as evidence of a templated naming scheme",
        "TLD switching: top 4 suffixes with counts if names span more than one",
        "N distinct domains across M brand clusters"
      ],
      "emptyState": "No evidence found."
    },
    "sourceAnalysis": {
      "order": [
        "Manual",
        "Google Search",
        "Variant",
        "Redirect",
        "Other"
      ],
      "fields": [
        "total",
        "gambling",
        "notGambling",
        "pctGambling"
      ],
      "denominator": "that category's total"
    },
    "regulatoryBlocking": {
      "scan": "LLM Reasoning",
      "caseInsensitive": true,
      "phrases": [
        "access to this site has been blocked",
        "court order",
        "regulatory authority",
        "illegal content",
        "not permitted in your country",
        "blocked by",
        "has been blocked",
        "ปิดกั้น",
        "คำสั่งศาล",
        "กระทรวงดิจิทัล"
      ],
      "except": "skip gambling rows whose reasoning also contains 'gambling site' (still active)",
      "capture": [
        "url",
        "cluster",
        "subcategory",
        "phrase",
        "excerpt"
      ],
      "excerptChars": 160,
      "note": "'illegal content' is retained as a trigger because it is a string found in third-party block pages, not a classification this report makes"
    },
    "ranking": {
      "parse": "Rank numeric",
      "scope": "gambling rows",
      "order": "ascending",
      "top": 15,
      "fields": [
        "rank",
        "domain",
        "cluster",
        "subcategory",
        "source"
      ],
      "fallback": "sample of up to 10 gambling rows with rank shown as '—'"
    }
  },
  "blocklistFeed": {
    "scope": "every gambling row",
    "fields": [
      "url",
      "domain",
      "cluster",
      "subcategory",
      "subcategoryMethod",
      "subcategoryConfidence",
      "signalTags",
      "source",
      "rank",
      "date",
      "status",
      "legalEntity",
      "legalEntityCountry"
    ],
    "constants": {
      "status": "gambling"
    },
    "dateFormat": "YYYY-MM-DD from 'Updated at', else raw",
    "consumedBy": "Blocklist screen, where an operator can promote a site to 'blacklisted'"
  },
  "report": {
    "sections": [
      {
        "id": "executive_summary",
        "title": "Executive summary",
        "position": "first",
        "blocks": [
          {
            "type": "summaryTable",
            "columns": [
              "Item",
              "Detail"
            ],
            "rows": [
              {
                "item": "Reporting period",
                "value": "{earliest} → {latest} ({days} days)"
              },
              {
                "item": "URLs analysed",
                "value": "{total}"
              },
              {
                "item": "Gambling sites identified",
                "value": "{gambling} ({gamblingShare}% of URLs analysed)"
              },
              {
                "item": "Not gambling / unreachable",
                "value": "{notGambling} / {unreachable}"
              },
              {
                "item": "Brand clusters identified",
                "value": "{distinctClusters}, of which {multiUrlClusters} hold more than one domain"
              },
              {
                "item": "Concentration",
                "value": "{clustersToHalf} clusters account for half of all gambling URLs"
              },
              {
                "item": "Largest cluster",
                "value": "{topCluster.name} — {topCluster.urlCount} domains"
              },
              {
                "item": "Dominant product subcategory",
                "value": "{topSubcategory.name} ({topSubcategory.pct}%)"
              },
              {
                "item": "Most common signal tag",
                "value": "{topSignalTag.name} ({topSignalTag.pct}%)"
              },
              {
                "item": "Already showing blocking indicators",
                "value": "{enforcement}"
              },
              {
                "item": "Subcategory confidence",
                "value": "{keywordAssignedPct}% keyword-assigned, {inferredShare}% inferred"
              }
            ],
            "note": "Every value is drawn from the computed metrics. Where a metric is unavailable the row is omitted, never estimated."
          }
        ],
        "precompute": [
          "topSubcategory",
          "topSignalTag",
          "keywordAssignedPct"
        ]
      },
      {
        "id": "numbers",
        "title": "The numbers",
        "blocks": [
          {
            "type": "metricCards",
            "cards": [
              "Total URLs analyzed",
              "Gambling sites",
              "Brand clusters identified",
              "Evaluation period (days, earliest → latest)"
            ]
          },
          {
            "type": "line",
            "title": "URLs analyzed per day",
            "data": "metrics.period.series"
          },
          {
            "type": "pie",
            "title": "Status distribution",
            "data": "metrics.statusDistribution",
            "withTable": [
              "status",
              "count",
              "pct"
            ],
            "colors": {
              "Gambling": "#c0392b",
              "Not gambling": "#9aa7b4",
              "Unreachable": "#7d3c98",
              "Unknown": "#e67e22"
            }
          },
          {
            "type": "bar",
            "title": "Top 10 URL suffixes",
            "data": "metrics.suffixes",
            "withTable": [
              "suffix",
              "total",
              "% of all",
              "gambling",
              "% gambling"
            ]
          }
        ]
      },
      {
        "id": "subcategories",
        "title": "Subcategories",
        "blocks": [
          {
            "type": "barHorizontal",
            "title": "Gambling sites by product subcategory",
            "data": "metrics.subcategoryDistribution",
            "sort": "desc",
            "palette": "presentation.palette.product",
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "donut",
            "title": "Subcategory share",
            "data": "metrics.subcategoryDistribution",
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "barStacked",
            "title": "Assignment method by subcategory",
            "data": "metrics.subcategoryDistribution.methodSplit",
            "seriesStyle": {
              "keyword": "subcategory colour at 100%",
              "inferred": "same hue at 45% opacity"
            },
            "caption": "inferredShare and generalShare",
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "table",
            "columns": [
              "subcategory",
              "count",
              "% of gambling",
              "keyword-assigned",
              "inferred",
              "distinct clusters"
            ]
          },
          {
            "type": "barHorizontal",
            "title": "Signal tags across the estate",
            "data": "metrics.signalTagDistribution",
            "caption": "tagsPerSite",
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "heatMap",
            "id": "keyword_x_subcategory",
            "title": "Keyword × subcategory",
            "rows": {
              "source": "metrics.keywordFrequency",
              "limit": 25,
              "label": "keyword",
              "labelAdornment": "coloured strip showing the keyword's own tab, so cross-tab bleed is visible at a glance"
            },
            "columns": {
              "source": "lexicon.categories where axis == 'product'",
              "limit": 7
            },
            "cell": "count of gambling sites matching that keyword within that subcategory",
            "scale": "presentation.heatMap",
            "rowLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            },
            "columnLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "heatMap",
            "id": "signaltag_x_subcategory",
            "title": "Signal tag × subcategory",
            "rows": {
              "source": "lexicon.categories where axis == 'signal'",
              "limit": 7
            },
            "columns": {
              "source": "lexicon.categories where axis == 'product'",
              "limit": 7
            },
            "cell": "site count",
            "reveals": "which products lean on promotional, payment or evasion language",
            "scale": "presentation.heatMap",
            "rowLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            },
            "columnLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          }
        ],
        "emptyState": {
          "condition": "no lexicon keyword matched at all",
          "render": "No lexicon keywords matched this sample; every gambling row was assigned by reasoning inference.",
          "also": "give keywordsNeverMatched in full",
          "suppress": [
            "keyword_x_subcategory",
            "signaltag_x_subcategory"
          ]
        }
      },
      {
        "id": "clustering",
        "title": "Brands and clustering",
        "blocks": [
          {
            "type": "metricCards",
            "cards": [
              "Distinct clusters",
              "Clusters with >= 2 URLs",
              "Singletons",
              "clustersToHalf"
            ]
          },
          {
            "type": "bar",
            "title": "Top 15 brand clusters by URL count",
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "line",
            "title": "Cluster concentration",
            "x": "clusters ranked",
            "y": "cumulative % of gambling URLs",
            "referenceLine": 50,
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "heatMap",
            "id": "cluster_x_subcategory",
            "title": "Brand cluster × subcategory",
            "rows": {
              "source": "clustering.clusters",
              "limit": 20,
              "label": "cluster name"
            },
            "columns": {
              "source": "lexicon.categories where axis == 'product'",
              "limit": 7
            },
            "cell": "URL count",
            "reveals": "multi-product operators appear as horizontal bands",
            "scale": "presentation.heatMap",
            "rowLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            },
            "columnLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "nodeDiagram",
            "title": "Cluster expansion — {topCluster.name}",
            "center": "cluster name",
            "nodes": "member domains",
            "edgeStyle": {
              "seed": "solid",
              "stem": "dashed",
              "similarity": "dotted"
            },
            "interpretation": "{name} is the largest cluster with {N} domains across {M} subcategories.",
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "table",
            "title": "Clusters spanning multiple subcategories",
            "columns": [
              "cluster",
              "URL count",
              "subcategories",
              "suffixes"
            ],
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "table",
            "title": "Clusters rotating top-level domains",
            "columns": [
              "cluster",
              "suffixes",
              "counts"
            ],
            "axisLabels": {
              "labelOrientation": "horizontal",
              "rotate": 0,
              "note": "Category and cluster names render upright. Where a name is too long for the axis, truncate with an ellipsis and give the full string in the tooltip — never rotate."
            }
          },
          {
            "type": "table",
            "title": "Possible operator linkage",
            "columns": [
              "cluster A",
              "cluster B",
              "shared keywords",
              "Jaccard"
            ],
            "label": "indicative"
          },
          {
            "type": "bullets",
            "title": "Naming convention insights",
            "data": "metrics.namingConventions"
          },
          {
            "type": "metricCards",
            "title": "Structure: direct → redirect → variant",
            "data": "metrics.structure"
          },
          {
            "type": "nodeDiagram",
            "title": "Redirect propagation — {topRedirect}",
            "renderIf": "topRedirect exists"
          }
        ],
        "emptyState": "No multi-URL brand clusters were detected in this sample; every domain appears to be standalone."
      },
      {
        "id": "ranking",
        "title": "Ranking",
        "blocks": [
          {
            "type": "table",
            "title": "Gambling ranking",
            "data": "metrics.ranking"
          }
        ]
      },
      {
        "id": "insights",
        "title": "Key insights",
        "blocks": [
          {
            "type": "narrativeCards",
            "data": "narrative.cards"
          }
        ]
      }
    ]
  },
  "narrative": {
    "precompute": [
      "gamblingShare",
      "topClusterShare = topCluster.urlCount / gambling * 100",
      "top10Share",
      "enforcement = regulatoryBlocking evidence count"
    ],
    "cards": [
      {
        "id": "scale",
        "title": "Scale of the analysis",
        "body": "Total distinct URLs over the evaluation period (days, plus earliest → latest if known), of which {gambling} gambling, {notGambling} not gambling, {unreachable} unreachable.",
        "take": "The sample is large enough to reason about patterns, not isolated cases."
      },
      {
        "id": "offering",
        "title": "What is being offered",
        "body": "The top three product subcategories with counts and shares, and the share of sites confirmed as gambling without an evidenced product type.",
        "take": "Name the dominant product type.",
        "conditionalTakes": [
          {
            "if": "top subcategory < 40% of gambling rows",
            "then": "say the estate is spread across product types rather than concentrated"
          }
        ]
      },
      {
        "id": "clustering",
        "title": "Brand clustering",
        "body": "{distinctClusters} clusters across {gambling} URLs; {multiUrlClusters} hold more than one domain; {clustersToHalf} clusters cover half the estate; the largest, {topCluster.name}, holds {topCluster.urlCount} domains across {M} subcategories.",
        "conditionalTakes": [
          {
            "if": "clustersToHalf > 10",
            "then": "the estate is diffuse and per-URL blocking will have limited leverage"
          }
        ],
        "take": "A small number of operators account for most of the estate, so enforcement against clusters is more efficient than against individual URLs."
      },
      {
        "id": "growth",
        "title": "How the estate is grown and marketed",
        "body": "{variantRows} crawler-identified variants, {redirectRows} behind redirect chains, {directRows} reached directly; busiest redirect source {topRedirect} with {topRedirect.count} destinations; {N} clusters rotate across more than one TLD; the two most common signal tags with their shares.",
        "take": "Redirects and TLD rotation keep a stable entry point while the sites behind it are replaced.",
        "conditionalTakes": [
          {
            "if": "promotions or vague_evasion dominate the signal tags",
            "then": "the acquisition route is promotional content rather than search, which changes where enforcement has to look"
          }
        ]
      },
      {
        "id": "enforcement",
        "title": "Enforcement position",
        "body": "{enforcement} pages already show regulatory-blocking indicators (court orders, regulator notices, block pages).",
        "take": "Prioritise enforcement by cluster rather than by URL."
      }
    ]
  },
  "presentation": {
    "percentDecimals": 1,
    "emptyStates": "explicit, never fabricated data",
    "methodDisclosure": "never present an inferred assignment as though it were keyword-derived; every subcategory figure carries its method split",
    "thaiText": {
      "render": "original script throughout",
      "neverTransliterate": true,
      "overflow": "truncate with an ellipsis on the axis and give the full string in the tooltip"
    },
    "methodologyFootnote": [
      "inferredShare",
      "generalShare",
      "clustering thresholds used"
    ],
    "palette": {
      "categorical": [
        "#1F3F63",
        "#c0392b",
        "#27ae60",
        "#7d3c98",
        "#9aa7b4",
        "#2f5c8f",
        "#e67e22"
      ],
      "product": {
        "assign": "descending count order",
        "note": "exactly seven product tabs, so no cycling is needed"
      },
      "signal": {
        "assign": "same palette at 70% opacity",
        "note": "keeps the two axes visually distinct"
      },
      "themeRequirement": "readable in light and dark themes"
    },
    "heatMap": {
      "scale": {
        "type": "sequential",
        "hue": "#1F3F63",
        "opacityFrom": 0.08,
        "opacityTo": 1.0
      },
      "zeroCell": {
        "fill": "page background",
        "border": "hairline",
        "rationale": "'no data' must be distinct from 'low count'"
      },
      "cellLabel": "integer count where the cell is wide enough, otherwise tooltip only",
      "textFlip": {
        "toWhiteAbove": 0.55
      },
      "rowOrder": "descending row total",
      "columnOrder": "descending column total",
      "cap": {
        "rows": 25,
        "columns": 12,
        "overflow": "collapse into a final 'Other' row or column with a note giving the number collapsed"
      },
      "legend": "count at both scale endpoints"
    },
    "coverageDisclosure": {
      "placement": "methodology footnote only, not the narrative",
      "rule": "If inferredShare > 30 or generalShare > 40, state in the footnote that subcategory figures are indicative.",
      "rationale": "Retained so thin subcategory splits are not presented as firm findings."
    },
    "page": {
      "size": "A4",
      "widthMm": 210,
      "heightMm": 297,
      "orientation": "portrait",
      "margins": {
        "topMm": 25,
        "bottomMm": 25,
        "leftMm": 25,
        "rightMm": 25
      },
      "contentWidthMm": 160,
      "bindingOffsetMm": 0,
      "note": "Left and right margins are equal at 25 mm, giving a 160 mm content column. Every chart, table and heat map is sized to that column; nothing bleeds into the margin.",
      "chartMaxWidthMm": 160,
      "tableMaxWidthMm": 160,
      "overflowPolicy": "A table or heat map wider than 160 mm reduces column count or font size; it is never rotated to landscape and never allowed to overrun the margin."
    }
  }
}