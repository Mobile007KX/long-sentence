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
        },
        {
            plain: "The ancient trees standing majestically in the heart of the rainforest have survived through countless storms and natural disasters over the past thousand years.",
            colored: '<span class="subject">The ancient trees</span> <span class="extra">standing majestically in the heart of the rainforest</span> <span class="verb">have survived</span> <span class="extra">through countless storms and natural disasters</span> <span class="extra">over the past thousand years</span>.',
            folded: '<span class="subject">The ancient trees</span> <details><summary>+ extras</summary><span class="extra">standing majestically in the heart of the rainforest</span></details> <span class="verb">have survived</span> <details><summary>+ extras</summary><span class="extra">through countless storms and natural disasters</span></details> <details><summary>+ extras</summary><span class="extra">over the past thousand years</span></details>.',
            skeleton: 'The trees have survived.',
            pattern: '① SV',
            difficulty: 3
        },
        {
            plain: "All the children playing happily in the neighborhood park suddenly disappeared when the ice cream truck arrived with its familiar melody echoing through the streets.",
            colored: '<span class="subject">All the children</span> <span class="extra">playing happily in the neighborhood park</span> <span class="extra">suddenly</span> <span class="verb">disappeared</span> <span class="extra">when the ice cream truck arrived with its familiar melody echoing through the streets</span>.',
            folded: '<span class="subject">All the children</span> <details><summary>+ extras</summary><span class="extra">playing happily in the neighborhood park</span></details> <details><summary>+ extras</summary><span class="extra">suddenly</span></details> <span class="verb">disappeared</span> <details><summary>+ extras</summary><span class="extra">when the ice cream truck arrived with its familiar melody echoing through the streets</span></details>.',
            skeleton: 'All the children disappeared.',
            pattern: '① SV',
            difficulty: 3
        },
        {
            plain: "The volcano that had remained dormant for over five centuries suddenly erupted with tremendous force, sending ash clouds thousands of feet into the atmosphere.",
            colored: '<span class="subject">The volcano</span> <span class="extra">that had remained dormant for over five centuries</span> <span class="extra">suddenly</span> <span class="verb">erupted</span> <span class="extra">with tremendous force</span> <span class="extra">, sending ash clouds thousands of feet into the atmosphere</span>.',
            folded: '<span class="subject">The volcano</span> <details><summary>+ extras</summary><span class="extra">that had remained dormant for over five centuries</span></details> <details><summary>+ extras</summary><span class="extra">suddenly</span></details> <span class="verb">erupted</span> <details><summary>+ extras</summary><span class="extra">with tremendous force</span></details> <details><summary>+ extras</summary><span class="extra">, sending ash clouds thousands of feet into the atmosphere</span></details>.',
            skeleton: 'The volcano erupted.',
            pattern: '① SV',
            difficulty: 4
        },
        {
            plain: "The migratory birds traveling thousands of miles from their winter habitats arrived precisely on schedule despite facing numerous challenges along their arduous journey.",
            colored: '<span class="subject">The migratory birds</span> <span class="extra">traveling thousands of miles from their winter habitats</span> <span class="verb">arrived</span> <span class="extra">precisely on schedule</span> <span class="extra">despite facing numerous challenges along their arduous journey</span>.',
            folded: '<span class="subject">The migratory birds</span> <details><summary>+ extras</summary><span class="extra">traveling thousands of miles from their winter habitats</span></details> <span class="verb">arrived</span> <details><summary>+ extras</summary><span class="extra">precisely on schedule</span></details> <details><summary>+ extras</summary><span class="extra">despite facing numerous challenges along their arduous journey</span></details>.',
            skeleton: 'The migratory birds arrived.',
            pattern: '① SV',
            difficulty: 3
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
        },
        {
            plain: "The ancient manuscript discovered in the monastery's hidden chamber proved to be an invaluable historical document containing secrets about medieval life.",
            colored: '<span class="subject">The ancient manuscript</span> <span class="extra">discovered in the monastery\'s hidden chamber</span> <span class="verb">proved</span> <span class="complement">to be an invaluable historical document</span> <span class="extra">containing secrets about medieval life</span>.',
            folded: '<span class="subject">The ancient manuscript</span> <details><summary>+ extras</summary><span class="extra">discovered in the monastery\'s hidden chamber</span></details> <span class="verb">proved</span> <span class="complement">to be an invaluable historical document</span> <details><summary>+ extras</summary><span class="extra">containing secrets about medieval life</span></details>.',
            skeleton: 'The manuscript proved to be a document.',
            pattern: '② SVP',
            difficulty: 3
        },
        {
            plain: "The weather forecast for the upcoming holiday weekend looks extremely promising with clear skies and comfortable temperatures expected throughout the region.",
            colored: '<span class="subject">The weather forecast</span> <span class="extra">for the upcoming holiday weekend</span> <span class="verb">looks</span> <span class="complement">extremely promising</span> <span class="extra">with clear skies and comfortable temperatures expected throughout the region</span>.',
            folded: '<span class="subject">The weather forecast</span> <details><summary>+ extras</summary><span class="extra">for the upcoming holiday weekend</span></details> <span class="verb">looks</span> <span class="complement">extremely promising</span> <details><summary>+ extras</summary><span class="extra">with clear skies and comfortable temperatures expected throughout the region</span></details>.',
            skeleton: 'The weather forecast looks promising.',
            pattern: '② SVP',
            difficulty: 3
        },
        {
            plain: "The solution proposed by the engineering team after months of research appeared remarkably simple yet elegantly solved the complex problem that had puzzled experts for years.",
            colored: '<span class="subject">The solution</span> <span class="extra">proposed by the engineering team after months of research</span> <span class="verb">appeared</span> <span class="complement">remarkably simple</span> <span class="extra">yet elegantly solved the complex problem that had puzzled experts for years</span>.',
            folded: '<span class="subject">The solution</span> <details><summary>+ extras</summary><span class="extra">proposed by the engineering team after months of research</span></details> <span class="verb">appeared</span> <span class="complement">remarkably simple</span> <details><summary>+ extras</summary><span class="extra">yet elegantly solved the complex problem that had puzzled experts for years</span></details>.',
            skeleton: 'The solution appeared simple.',
            pattern: '② SVP',
            difficulty: 4
        },
        {
            plain: "The atmosphere at the championship game between the two rival teams remained incredibly tense until the final seconds when the underdog scored the winning goal.",
            colored: '<span class="subject">The atmosphere</span> <span class="extra">at the championship game between the two rival teams</span> <span class="verb">remained</span> <span class="complement">incredibly tense</span> <span class="extra">until the final seconds when the underdog scored the winning goal</span>.',
            folded: '<span class="subject">The atmosphere</span> <details><summary>+ extras</summary><span class="extra">at the championship game between the two rival teams</span></details> <span class="verb">remained</span> <span class="complement">incredibly tense</span> <details><summary>+ extras</summary><span class="extra">until the final seconds when the underdog scored the winning goal</span></details>.',
            skeleton: 'The atmosphere remained tense.',
            pattern: '② SVP',
            difficulty: 3
        }
    ],
    3: [ // SVO (Subject + Verb + Object)
        {
            plain: "The brilliant scientist who had dedicated her entire life to cancer research finally discovered a revolutionary treatment that could potentially save millions of lives worldwide.",
            colored: '<span class="subject">The brilliant scientist</span> <span class="extra">who had dedicated her entire life to cancer research</span> <span class="extra">finally</span> <span class="verb">discovered</span> <span class="object">a revolutionary treatment</span> <span class="extra">that could potentially save millions of lives worldwide</span>.',
            folded: '<span class="subject">The brilliant scientist</span> <details><summary>+ extras</summary><span class="extra">who had dedicated her entire life to cancer research</span></details> <details><summary>+ extras</summary><span class="extra">finally</span></details> <span class="verb">discovered</span> <span class="object">a revolutionary treatment</span> <details><summary>+ extras</summary><span class="extra">that could potentially save millions of lives worldwide</span></details>.',
            skeleton: 'The scientist discovered a treatment.',
            pattern: '③ SVO',
            difficulty: 4
        },
        {
            plain: "The experienced detective examining the crime scene with meticulous attention to detail noticed several crucial clues that everyone else had completely overlooked during the initial investigation.",
            colored: '<span class="subject">The experienced detective</span> <span class="extra">examining the crime scene with meticulous attention to detail</span> <span class="verb">noticed</span> <span class="object">several crucial clues</span> <span class="extra">that everyone else had completely overlooked during the initial investigation</span>.',
            folded: '<span class="subject">The experienced detective</span> <details><summary>+ extras</summary><span class="extra">examining the crime scene with meticulous attention to detail</span></details> <span class="verb">noticed</span> <span class="object">several crucial clues</span> <details><summary>+ extras</summary><span class="extra">that everyone else had completely overlooked during the initial investigation</span></details>.',
            skeleton: 'The detective noticed clues.',
            pattern: '③ SVO',
            difficulty: 4
        },
        {
            plain: "The ambitious entrepreneurs who started their business in a small garage developed an innovative app that revolutionized how people communicate across different languages and cultures.",
            colored: '<span class="subject">The ambitious entrepreneurs</span> <span class="extra">who started their business in a small garage</span> <span class="verb">developed</span> <span class="object">an innovative app</span> <span class="extra">that revolutionized how people communicate across different languages and cultures</span>.',
            folded: '<span class="subject">The ambitious entrepreneurs</span> <details><summary>+ extras</summary><span class="extra">who started their business in a small garage</span></details> <span class="verb">developed</span> <span class="object">an innovative app</span> <details><summary>+ extras</summary><span class="extra">that revolutionized how people communicate across different languages and cultures</span></details>.',
            skeleton: 'The entrepreneurs developed an app.',
            pattern: '③ SVO',
            difficulty: 3
        },
        {
            plain: "The environmental organization fighting against deforestation for decades has protected thousands of acres of rainforest from illegal logging operations funded by corrupt corporations.",
            colored: '<span class="subject">The environmental organization</span> <span class="extra">fighting against deforestation for decades</span> <span class="verb">has protected</span> <span class="object">thousands of acres of rainforest</span> <span class="extra">from illegal logging operations funded by corrupt corporations</span>.',
            folded: '<span class="subject">The environmental organization</span> <details><summary>+ extras</summary><span class="extra">fighting against deforestation for decades</span></details> <span class="verb">has protected</span> <span class="object">thousands of acres of rainforest</span> <details><summary>+ extras</summary><span class="extra">from illegal logging operations funded by corrupt corporations</span></details>.',
            skeleton: 'The organization has protected acres.',
            pattern: '③ SVO',
            difficulty: 4
        },
        {
            plain: "The documentary filmmaker traveling to remote corners of the world captured extraordinary footage of endangered species that most people will never have the chance to see in person.",
            colored: '<span class="subject">The documentary filmmaker</span> <span class="extra">traveling to remote corners of the world</span> <span class="verb">captured</span> <span class="object">extraordinary footage of endangered species</span> <span class="extra">that most people will never have the chance to see in person</span>.',
            folded: '<span class="subject">The documentary filmmaker</span> <details><summary>+ extras</summary><span class="extra">traveling to remote corners of the world</span></details> <span class="verb">captured</span> <span class="object">extraordinary footage of endangered species</span> <details><summary>+ extras</summary><span class="extra">that most people will never have the chance to see in person</span></details>.',
            skeleton: 'The filmmaker captured footage.',
            pattern: '③ SVO',
            difficulty: 3
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
        },
        {
            plain: "The experienced teacher working in the inner-city school taught her students important life lessons that went far beyond the standard curriculum required by the education board.",
            colored: '<span class="subject">The experienced teacher</span> <span class="extra">working in the inner-city school</span> <span class="verb">taught</span> <span class="object">her students</span> <span class="object">important life lessons</span> <span class="extra">that went far beyond the standard curriculum required by the education board</span>.',
            folded: '<span class="subject">The experienced teacher</span> <details><summary>+ extras</summary><span class="extra">working in the inner-city school</span></details> <span class="verb">taught</span> <span class="object">her students</span> <span class="object">important life lessons</span> <details><summary>+ extras</summary><span class="extra">that went far beyond the standard curriculum required by the education board</span></details>.',
            skeleton: 'The teacher taught her students lessons.',
            pattern: '④ SVOO',
            difficulty: 3
        },
        {
            plain: "The acclaimed author visiting schools across the country regularly sends young aspiring writers personalized feedback on their stories to encourage their creative development.",
            colored: '<span class="subject">The acclaimed author</span> <span class="extra">visiting schools across the country</span> <span class="extra">regularly</span> <span class="verb">sends</span> <span class="object">young aspiring writers</span> <span class="object">personalized feedback on their stories</span> <span class="extra">to encourage their creative development</span>.',
            folded: '<span class="subject">The acclaimed author</span> <details><summary>+ extras</summary><span class="extra">visiting schools across the country</span></details> <details><summary>+ extras</summary><span class="extra">regularly</span></details> <span class="verb">sends</span> <span class="object">young aspiring writers</span> <span class="object">personalized feedback on their stories</span> <details><summary>+ extras</summary><span class="extra">to encourage their creative development</span></details>.',
            skeleton: 'The author sends writers feedback.',
            pattern: '④ SVOO',
            difficulty: 3
        },
        {
            plain: "The technology company launching its revolutionary product next month will offer early adopters exclusive benefits including lifetime updates and premium support services.",
            colored: '<span class="subject">The technology company</span> <span class="extra">launching its revolutionary product next month</span> <span class="verb">will offer</span> <span class="object">early adopters</span> <span class="object">exclusive benefits</span> <span class="extra">including lifetime updates and premium support services</span>.',
            folded: '<span class="subject">The technology company</span> <details><summary>+ extras</summary><span class="extra">launching its revolutionary product next month</span></details> <span class="verb">will offer</span> <span class="object">early adopters</span> <span class="object">exclusive benefits</span> <details><summary>+ extras</summary><span class="extra">including lifetime updates and premium support services</span></details>.',
            skeleton: 'The company will offer adopters benefits.',
            pattern: '④ SVOO',
            difficulty: 3
        },
        {
            plain: "The grandmother living in the countryside always sends her grandchildren homemade cookies and preserves made from fruits grown in her own garden every holiday season.",
            colored: '<span class="subject">The grandmother</span> <span class="extra">living in the countryside</span> <span class="extra">always</span> <span class="verb">sends</span> <span class="object">her grandchildren</span> <span class="object">homemade cookies and preserves</span> <span class="extra">made from fruits grown in her own garden</span> <span class="extra">every holiday season</span>.',
            folded: '<span class="subject">The grandmother</span> <details><summary>+ extras</summary><span class="extra">living in the countryside</span></details> <details><summary>+ extras</summary><span class="extra">always</span></details> <span class="verb">sends</span> <span class="object">her grandchildren</span> <span class="object">homemade cookies and preserves</span> <details><summary>+ extras</summary><span class="extra">made from fruits grown in her own garden</span></details> <details><summary>+ extras</summary><span class="extra">every holiday season</span></details>.',
            skeleton: 'The grandmother sends her grandchildren cookies.',
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
        },
        {
            plain: "The talented chef who had trained in Paris for years made the simple ingredients absolutely extraordinary through his innovative cooking techniques and artistic presentation.",
            colored: '<span class="subject">The talented chef</span> <span class="extra">who had trained in Paris for years</span> <span class="verb">made</span> <span class="object">the simple ingredients</span> <span class="complement">absolutely extraordinary</span> <span class="extra">through his innovative cooking techniques and artistic presentation</span>.',
            folded: '<span class="subject">The talented chef</span> <details><summary>+ extras</summary><span class="extra">who had trained in Paris for years</span></details> <span class="verb">made</span> <span class="object">the simple ingredients</span> <span class="complement">absolutely extraordinary</span> <details><summary>+ extras</summary><span class="extra">through his innovative cooking techniques and artistic presentation</span></details>.',
            skeleton: 'The chef made the ingredients extraordinary.',
            pattern: '⑤ SVOC',
            difficulty: 3
        },
        {
            plain: "The board of directors meeting in an emergency session appointed the experienced executive temporary CEO while they searched for a permanent replacement for the position.",
            colored: '<span class="subject">The board of directors</span> <span class="extra">meeting in an emergency session</span> <span class="verb">appointed</span> <span class="object">the experienced executive</span> <span class="complement">temporary CEO</span> <span class="extra">while they searched for a permanent replacement for the position</span>.',
            folded: '<span class="subject">The board of directors</span> <details><summary>+ extras</summary><span class="extra">meeting in an emergency session</span></details> <span class="verb">appointed</span> <span class="object">the experienced executive</span> <span class="complement">temporary CEO</span> <details><summary>+ extras</summary><span class="extra">while they searched for a permanent replacement for the position</span></details>.',
            skeleton: 'The board appointed the executive CEO.',
            pattern: '⑤ SVOC',
            difficulty: 3
        },
        {
            plain: "The harsh winter conditions that lasted for months made the mountain roads completely impassable forcing residents to rely on helicopters for essential supplies.",
            colored: '<span class="subject">The harsh winter conditions</span> <span class="extra">that lasted for months</span> <span class="verb">made</span> <span class="object">the mountain roads</span> <span class="complement">completely impassable</span> <span class="extra">forcing residents to rely on helicopters for essential supplies</span>.',
            folded: '<span class="subject">The harsh winter conditions</span> <details><summary>+ extras</summary><span class="extra">that lasted for months</span></details> <span class="verb">made</span> <span class="object">the mountain roads</span> <span class="complement">completely impassable</span> <details><summary>+ extras</summary><span class="extra">forcing residents to rely on helicopters for essential supplies</span></details>.',
            skeleton: 'The conditions made the roads impassable.',
            pattern: '⑤ SVOC',
            difficulty: 3
        },
        {
            plain: "The revolutionary technology developed by the startup company rendered traditional manufacturing methods obsolete within just a few years of its introduction to the market.",
            colored: '<span class="subject">The revolutionary technology</span> <span class="extra">developed by the startup company</span> <span class="verb">rendered</span> <span class="object">traditional manufacturing methods</span> <span class="complement">obsolete</span> <span class="extra">within just a few years of its introduction to the market</span>.',
            folded: '<span class="subject">The revolutionary technology</span> <details><summary>+ extras</summary><span class="extra">developed by the startup company</span></details> <span class="verb">rendered</span> <span class="object">traditional manufacturing methods</span> <span class="complement">obsolete</span> <details><summary>+ extras</summary><span class="extra">within just a few years of its introduction to the market</span></details>.',
            skeleton: 'The technology rendered methods obsolete.',
            pattern: '⑤ SVOC',
            difficulty: 3
        }
    ]
};