            skeleton: 'The engineer fixed the error.',
            pattern: '③ SVO',
            difficulty: 4
        },
        {
            plain: "The marine biologist studying coral reefs in the Pacific Ocean has documented alarming changes in the ecosystem caused by rising water temperatures and pollution.",
            colored: '<span class="subject">The marine biologist</span> <span class="extra">studying coral reefs in the Pacific Ocean</span> <span class="verb">has documented</span> <span class="object">alarming changes in the ecosystem</span> <span class="extra">caused by rising water temperatures and pollution</span>.',
            folded: '<span class="subject">The marine biologist</span> <details><summary>+ extras</summary><span class="extra">studying coral reefs in the Pacific Ocean</span></details> <span class="verb">has documented</span> <span class="object">alarming changes in the ecosystem</span> <details><summary>+ extras</summary><span class="extra">caused by rising water temperatures and pollution</span></details>.',
            skeleton: 'The biologist has documented changes.',
            pattern: '③ SVO',
            difficulty: 3
        },
        {
            plain: "The master chef preparing for the international competition carefully selected the finest ingredients from local markets to create his signature dish that would impress the judges.",
            colored: '<span class="subject">The master chef</span> <span class="extra">preparing for the international competition</span> <span class="extra">carefully</span> <span class="verb">selected</span> <span class="object">the finest ingredients</span> <span class="extra">from local markets</span> <span class="extra">to create his signature dish that would impress the judges</span>.',
            folded: '<span class="subject">The master chef</span> <details><summary>+ extras</summary><span class="extra">preparing for the international competition</span></details> <details><summary>+ extras</summary><span class="extra">carefully</span></details> <span class="verb">selected</span> <span class="object">the finest ingredients</span> <details><summary>+ extras</summary><span class="extra">from local markets</span></details> <details><summary>+ extras</summary><span class="extra">to create his signature dish that would impress the judges</span></details>.',
            skeleton: 'The chef selected ingredients.',
            pattern: '③ SVO',
            difficulty: 4
        },
        {
            plain: "The historians analyzing recently declassified documents from the Cold War era have revealed shocking secrets about covert operations that shaped modern geopolitics.",
            colored: '<span class="subject">The historians</span> <span class="extra">analyzing recently declassified documents from the Cold War era</span> <span class="verb">have revealed</span> <span class="object">shocking secrets about covert operations</span> <span class="extra">that shaped modern geopolitics</span>.',
            folded: '<span class="subject">The historians</span> <details><summary>+ extras</summary><span class="extra">analyzing recently declassified documents from the Cold War era</span></details> <span class="verb">have revealed</span> <span class="object">shocking secrets about covert operations</span> <details><summary>+ extras</summary><span class="extra">that shaped modern geopolitics</span></details>.',
            skeleton: 'The historians have revealed secrets.',
            pattern: '③ SVO',
            difficulty: 3
        }
    ],

    // Pattern 4: SVOO (Subject + Verb + Indirect Object + Direct Object) 主谓双宾结构
    4: [
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
        },
        {
            plain: "The international organization dedicated to disaster relief brought the earthquake victims essential supplies including clean water, medical equipment, and temporary shelters within hours of the catastrophe.",
            colored: '<span class="subject">The international organization</span> <span class="extra">dedicated to disaster relief</span> <span class="verb">brought</span> <span class="object">the earthquake victims</span> <span class="object">essential supplies</span> <span class="extra">including clean water, medical equipment, and temporary shelters</span> <span class="extra">within hours of the catastrophe</span>.',
            folded: '<span class="subject">The international organization</span> <details><summary>+ extras</summary><span class="extra">dedicated to disaster relief</span></details> <span class="verb">brought</span> <span class="object">the earthquake victims</span> <span class="object">essential supplies</span> <details><summary>+ extras</summary><span class="extra">including clean water, medical equipment, and temporary shelters</span></details> <details><summary>+ extras</summary><span class="extra">within hours of the catastrophe</span></details>.',
            skeleton: 'The organization brought victims supplies.',
            pattern: '④ SVOO',
            difficulty: 4
        },
        {
            plain: "The museum curator organizing the special exhibition showed visiting journalists rare artifacts that had never been displayed to the public before this historic event.",
            colored: '<span class="subject">The museum curator</span> <span class="extra">organizing the special exhibition</span> <span class="verb">showed</span> <span class="object">visiting journalists</span> <span class="object">rare artifacts</span> <span class="extra">that had never been displayed to the public before this historic event</span>.',
            folded: '<span class="subject">The museum curator</span> <details><summary>+ extras</summary><span class="extra">organizing the special exhibition</span></details> <span class="verb">showed</span> <span class="object">visiting journalists</span> <span class="object">rare artifacts</span> <details><summary>+ extras</summary><span class="extra">that had never been displayed to the public before this historic event</span></details>.',
            skeleton: 'The curator showed journalists artifacts.',
            pattern: '④ SVOO',
            difficulty: 3
        },
        {
            plain: "The travel agent specializing in luxury vacations offered the newlyweds an unforgettable honeymoon package featuring exclusive resorts and private tours of exotic destinations.",
            colored: '<span class="subject">The travel agent</span> <span class="extra">specializing in luxury vacations</span> <span class="verb">offered</span> <span class="object">the newlyweds</span> <span class="object">an unforgettable honeymoon package</span> <span class="extra">featuring exclusive resorts and private tours of exotic destinations</span>.',
            folded: '<span class="subject">The travel agent</span> <details><summary>+ extras</summary><span class="extra">specializing in luxury vacations</span></details> <span class="verb">offered</span> <span class="object">the newlyweds</span> <span class="object">an unforgettable honeymoon package</span> <details><summary>+ extras</summary><span class="extra">featuring exclusive resorts and private tours of exotic destinations</span></details>.',
            skeleton: 'The agent offered the newlyweds a package.',
            pattern: '④ SVOO',
            difficulty: 3
        },
        {
            plain: "The famous conductor leading the symphony orchestra gave the young musicians invaluable advice about pursuing careers in classical music during these challenging times.",
            colored: '<span class="subject">The famous conductor</span> <span class="extra">leading the symphony orchestra</span> <span class="verb">gave</span> <span class="object">the young musicians</span> <span class="object">invaluable advice about pursuing careers</span> <span class="extra">in classical music during these challenging times</span>.',
            folded: '<span class="subject">The famous conductor</span> <details><summary>+ extras</summary><span class="extra">leading the symphony orchestra</span></details> <span class="verb">gave</span> <span class="object">the young musicians</span> <span class="object">invaluable advice about pursuing careers</span> <details><summary>+ extras</summary><span class="extra">in classical music during these challenging times</span></details>.',
            skeleton: 'The conductor gave musicians advice.',
            pattern: '④ SVOO',
            difficulty: 3
        },
        {
            plain: "The software company responding to customer feedback sent all users a comprehensive update that fixed numerous bugs and added highly requested features to their platform.",
            colored: '<span class="subject">The software company</span> <span class="extra">responding to customer feedback</span> <span class="verb">sent</span> <span class="object">all users</span> <span class="object">a comprehensive update</span> <span class="extra">that fixed numerous bugs and added highly requested features to their platform</span>.',
            folded: '<span class="subject">The software company</span> <details><summary>+ extras</summary><span class="extra">responding to customer feedback</span></details> <span class="verb">sent</span> <span class="object">all users</span> <span class="object">a comprehensive update</span> <details><summary>+ extras</summary><span class="extra">that fixed numerous bugs and added highly requested features to their platform</span></details>.',
            skeleton: 'The company sent users an update.',
            pattern: '④ SVOO',
            difficulty: 3
        }
    ],

    // Pattern 5: SVOC (Subject + Verb + Object + Complement) 主谓宾补结构
    5: [
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
        },
        {
            plain: "The inspiring speech delivered by the civil rights leader made the audience deeply aware of the injustices that still plagued society despite decades of progress.",
            colored: '<span class="subject">The inspiring speech</span> <span class="extra">delivered by the civil rights leader</span> <span class="verb">made</span> <span class="object">the audience</span> <span class="complement">deeply aware of the injustices</span> <span class="extra">that still plagued society despite decades of progress</span>.',
            folded: '<span class="subject">The inspiring speech</span> <details><summary>+ extras</summary><span class="extra">delivered by the civil rights leader</span></details> <span class="verb">made</span> <span class="object">the audience</span> <span class="complement">deeply aware of the injustices</span> <details><summary>+ extras</summary><span class="extra">that still plagued society despite decades of progress</span></details>.',
            skeleton: 'The speech made the audience aware.',
            pattern: '⑤ SVOC',
            difficulty: 4
        },
        {
            plain: "The expert panel reviewing the research findings declared the new drug safe for human trials after extensive testing on laboratory animals showed promising results.",
            colored: '<span class="subject">The expert panel</span> <span class="extra">reviewing the research findings</span> <span class="verb">declared</span> <span class="object">the new drug</span> <span class="complement">safe for human trials</span> <span class="extra">after extensive testing on laboratory animals showed promising results</span>.',
            folded: '<span class="subject">The expert panel</span> <details><summary>+ extras</summary><span class="extra">reviewing the research findings</span></details> <span class="verb">declared</span> <span class="object">the new drug</span> <span class="complement">safe for human trials</span> <details><summary>+ extras</summary><span class="extra">after extensive testing on laboratory animals showed promising results</span></details>.',
            skeleton: 'The panel declared the drug safe.',
            pattern: '⑤ SVOC',
            difficulty: 3
        },
        {
            plain: "The unexpected turn of events during the championship game left the home team victorious against all odds and their fans absolutely ecstatic with joy.",
            colored: '<span class="subject">The unexpected turn of events</span> <span class="extra">during the championship game</span> <span class="verb">left</span> <span class="object">the home team</span> <span class="complement">victorious against all odds</span> <span class="extra">and their fans absolutely ecstatic with joy</span>.',
            folded: '<span class="subject">The unexpected turn of events</span> <details><summary>+ extras</summary><span class="extra">during the championship game</span></details> <span class="verb">left</span> <span class="object">the home team</span> <span class="complement">victorious against all odds</span> <details><summary>+ extras</summary><span class="extra">and their fans absolutely ecstatic with joy</span></details>.',
            skeleton: 'The events left the team victorious.',
            pattern: '⑤ SVOC',
            difficulty: 3
        },
        {
            plain: "The judge presiding over the high-profile case found the defendant guilty of all charges despite the defense team's efforts to create reasonable doubt.",
            colored: '<span class="subject">The judge</span> <span class="extra">presiding over the high-profile case</span> <span class="verb">found</span> <span class="object">the defendant</span> <span class="complement">guilty of all charges</span> <span class="extra">despite the defense team\'s efforts to create reasonable doubt</span>.',
            folded: '<span class="subject">The judge</span> <details><summary>+ extras</summary><span class="extra">presiding over the high-profile case</span></details> <span class="verb">found</span> <span class="object">the defendant</span> <span class="complement">guilty of all charges</span> <details><summary>+ extras</summary><span class="extra">despite the defense team\'s efforts to create reasonable doubt</span></details>.',
            skeleton: 'The judge found the defendant guilty.',
            pattern: '⑤ SVOC',
            difficulty: 3
        },
        {
            plain: "The architectural review board considering various submissions for the new city hall project judged the modern design most suitable for representing the city's progressive vision.",
            colored: '<span class="subject">The architectural review board</span> <span class="extra">considering various submissions for the new city hall project</span> <span class="verb">judged</span> <span class="object">the modern design</span> <span class="complement">most suitable</span> <span class="extra">for representing the city\'s progressive vision</span>.',
            folded: '<span class="subject">The architectural review board</span> <details><summary>+ extras</summary><span class="extra">considering various submissions for the new city hall project</span></details> <span class="verb">judged</span> <span class="object">the modern design</span> <span class="complement">most suitable</span> <details><summary>+ extras</summary><span class="extra">for representing the city\'s progressive vision</span></details>.',
            skeleton: 'The board judged the design suitable.',
            pattern: '⑤ SVOC',
            difficulty: 4
        }
    ]
};

// Export for use in main file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = fullSentenceDatabase;
}