// Complete sentence database
const sentenceDatabase = {
    1: [ // SV (Subject + Verb)
        {
            plain: "The exhausted marathon runners who had been training for months in the scorching heat finally collapsed at the finish line after completing the grueling twenty-six mile race.",
            colored: '<span class="subject">The exhausted marathon runners</span> <span class="extra">who had been training for months in the scorching heat</span> <span class="extra">finally</span> <span class="verb">collapsed</span> <span class="extra">at the finish line</span> <span class="extra">after completing the grueling twenty-six mile race</span>.',
            folded: '<span class="subject">The exhausted marathon runners</span> <details><summary>+ extras</summary><span class="extra">who had been training for months in the scorching heat</span></details> <details><summary>+ extras</summary><span class="extra">finally</span></details> <span class="verb">collapsed</span> <details><summary>+ extras</summary><span class="extra">at the finish line</span></details> <details><summary>+ extras</summary><span class="extra">after completing the grueling twenty-six mile race</span></details>.',
            skeleton: 'The marathon runners collapsed.',
            pattern: '① SV',
            difficulty: 4
        }
    ],
    2: [ // SVP (Subject + Verb + Predicative)
        {
            plain: "The innovative startup founded by young entrepreneurs in Silicon Valley became incredibly successful within just two years despite fierce competition from established tech giants.",
            colored: '<span class="subject">The innovative startup</span> <span class="extra">founded by young entrepreneurs in Silicon Valley</span> <span class="verb">became</span> <span class="complement">incredibly successful</span> <span class="extra">within just two years</span> <span class="extra">despite fierce competition from established tech giants</span>.',
            folded: '<span class="subject">The innovative startup</span> <details><summary>+ extras</summary><span class="extra">founded by young entrepreneurs in Silicon Valley</span></details> <span class="verb">became</span> <span class="complement">incredibly successful</span> <details><summary>+ extras</summary><span class="extra">within just two years</span></details> <details><summary>+ extras</summary><span class="extra">despite fierce competition from established tech giants</span></details>.',
            skeleton: 'The startup became successful.',
            pattern: '② SVP',
            difficulty: 4
        }
    ],
    3: [ // SVO (Subject + Verb + Object)
        {
            plain: "The brilliant scientist who had dedicated her entire life to cancer research finally discovered a revolutionary treatment that could potentially save millions of lives worldwide.",
            colored: '<span class="subject">The brilliant scientist</span> <span class="extra">who had dedicated her entire life to cancer research</span> <span class="extra">finally</span> <span class="verb">discovered</span> <span class="object">a revolutionary treatment</span> <span class="extra">that could potentially save millions of lives worldwide</span>.',
            folded: '<span class="subject">The brilliant scientist</span> <details><summary>+ extras</summary><span class="extra">who had dedicated her entire life to cancer research</span></details> <details><summary>+ extras</summary><span class="extra">finally</span></details> <span class="verb">discovered</span> <span class="object">a revolutionary treatment</span> <details><summary>+ extras</summary><span class="extra">that could potentially save millions of lives worldwide</span></details>.',            skeleton: 'The scientist discovered a treatment.',
            pattern: '③ SVO',
            difficulty: 4
        }
    ],
    4: [ // SVOO (Subject + Verb + Indirect Object + Direct Object)
        {
            plain: "The generous philanthropist who had built his fortune through decades of hard work gave the struggling university a massive donation that would fund scholarships for underprivileged students.",
            colored: '<span class="subject">The generous philanthropist</span> <span class="extra">who had built his fortune through decades of hard work</span> <span class="verb">gave</span> <span class="object">the struggling university</span> <span class="object">a massive donation</span> <span class="extra">that would fund scholarships for underprivileged students</span>.',
            folded: '<span class="subject">The generous philanthropist</span> <details><summary>+ extras</summary><span class="extra">who had built his fortune through decades of hard work</span></details> <span class="verb">gave</span> <span class="object">the struggling university</span> <span class="object">a massive donation</span> <details><summary>+ extras</summary><span class="extra">that would fund scholarships for underprivileged students</span></details>.',
            skeleton: 'The philanthropist gave the university a donation.',
            pattern: '④ SVOO',
            difficulty: 4
        }
    ],
    5: [ // SVOC (Subject + Verb + Object + Complement)
        {
            plain: "The international committee after months of deliberation and heated debates deemed the controversial proposal completely unacceptable for implementation in developing countries.",
            colored: '<span class="subject">The international committee</span> <span class="extra">after months of deliberation and heated debates</span> <span class="verb">deemed</span> <span class="object">the controversial proposal</span> <span class="complement">completely unacceptable</span> <span class="extra">for implementation in developing countries</span>.',
            folded: '<span class="subject">The international committee</span> <details><summary>+ extras</summary><span class="extra">after months of deliberation and heated debates</span></details> <span class="verb">deemed</span> <span class="object">the controversial proposal</span> <span class="complement">completely unacceptable</span> <details><summary>+ extras</summary><span class="extra">for implementation in developing countries</span></details>.',
            skeleton: 'The committee deemed the proposal unacceptable.',
            pattern: '⑤ SVOC',
            difficulty: 4
        }
    ]
};