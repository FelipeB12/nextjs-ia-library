import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@library.com" },
    update: {},
    create: {
      email: "admin@library.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      name: "Test User",
      password: userPassword,
      role: "CUSTOMER",
    },
  });

  // ── Books ──────────────────────────────────────────────────────────────────
  const books = [
    // Science Fiction (15)
    {
      title: "Dune",
      author: "Frank Herbert",
      genre: "Science Fiction",
      summary:
        "Set in the distant future, Dune follows Paul Atreides as his family takes control of the desert planet Arrakis, the only source of the most valuable substance in the universe. A sweeping tale of politics, religion, and ecology that defined modern science fiction.",
      publishedDate: new Date("1965-08-01"),
      isbn: "9780441013593",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Neuromancer",
      author: "William Gibson",
      genre: "Science Fiction",
      summary:
        "Case is a washed-up computer hacker hired by a mysterious employer to pull off the ultimate hack. A groundbreaking cyberpunk novel that coined the term 'cyberspace' and predicted the internet age.",
      publishedDate: new Date("1984-07-01"),
      isbn: "9780441569595",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "The Left Hand of Darkness",
      author: "Ursula K. Le Guin",
      genre: "Science Fiction",
      summary:
        "An envoy from the interplanetary union visits a planet where humans have no fixed gender, challenging every assumption about sex, politics, and society. Le Guin's masterwork explores what it means to be human.",
      publishedDate: new Date("1969-03-01"),
      isbn: "9780441478125",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Foundation",
      author: "Isaac Asimov",
      genre: "Science Fiction",
      summary:
        "Mathematician Hari Seldon predicts the fall of the Galactic Empire and devises a plan to preserve civilization through a dark age. The first book in Asimov's legendary Foundation series spanning thousands of years.",
      publishedDate: new Date("1951-05-01"),
      isbn: "9780553293357",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Martian",
      author: "Andy Weir",
      genre: "Science Fiction",
      summary:
        "Astronaut Mark Watney is stranded alone on Mars after a freak storm and must use his ingenuity to survive until a rescue mission can reach him. A tense, funny, and scientifically grounded survival story.",
      publishedDate: new Date("2011-09-27"),
      isbn: "9780804139021",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Ender's Game",
      author: "Orson Scott Card",
      genre: "Science Fiction",
      summary:
        "A brilliant child named Ender Wiggin is recruited to a military school in space to prepare for an alien invasion. A profound examination of violence, empathy, and what it means to be a leader.",
      publishedDate: new Date("1985-01-15"),
      isbn: "9780812550702",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Hyperion",
      author: "Dan Simmons",
      genre: "Science Fiction",
      summary:
        "Seven pilgrims travel to the planet Hyperion and share their stories en route to an encounter with the mysterious Time Tombs. A rich Canterbury Tales–inspired epic that blends horror, romance, and hard SF.",
      publishedDate: new Date("1989-05-26"),
      isbn: "9780553283686",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Brave New World",
      author: "Aldous Huxley",
      genre: "Science Fiction",
      summary:
        "In a genetically engineered future where pleasure is the highest goal, one man dares to question the cost of a perfectly ordered society. A haunting vision of a world sacrificed for stability and happiness.",
      publishedDate: new Date("1932-01-01"),
      isbn: "9780060850524",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: "Douglas Adams",
      genre: "Science Fiction",
      summary:
        "Seconds before Earth is demolished for a hyperspace bypass, Arthur Dent is swept into the galaxy by his alien friend Ford Prefect. A beloved comedic odyssey through the absurdity of existence.",
      publishedDate: new Date("1979-10-12"),
      isbn: "9780345391803",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Do Androids Dream of Electric Sheep?",
      author: "Philip K. Dick",
      genre: "Science Fiction",
      summary:
        "In a post-apocalyptic Earth, bounty hunter Rick Deckard tracks down rogue androids while questioning the nature of empathy and what it means to be alive. The inspiration for the film Blade Runner.",
      publishedDate: new Date("1968-03-01"),
      isbn: "9780345404473",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "The Stars Between Us",
      author: "Vero Marel",
      genre: "Science Fiction",
      summary:
        "Two rival navigators on a colony ship must cooperate to survive when their vessel is pulled off course by an uncharted gravity well. A tense human story about trust and survival across the void.",
      publishedDate: new Date("2019-04-10"),
      isbn: "9781984802341",
      totalCopies: 2,
      copiesAvailable: 2,
    },
    {
      title: "Project Hail Mary",
      author: "Andy Weir",
      genre: "Science Fiction",
      summary:
        "A lone astronaut wakes up with no memory millions of miles from Earth and must figure out how to save humanity from extinction. A thrilling and heartfelt story of problem-solving and unexpected friendship.",
      publishedDate: new Date("2021-05-04"),
      isbn: "9780593135204",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Children of Time",
      author: "Adrian Tchaikovsky",
      genre: "Science Fiction",
      summary:
        "The last remnants of humanity race to claim a terraformed world, unaware that its spider inhabitants have already evolved to dominance. A sweeping dual narrative about the nature of civilization itself.",
      publishedDate: new Date("2015-06-04"),
      isbn: "9780316452502",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Blindsight",
      author: "Peter Watts",
      genre: "Science Fiction",
      summary:
        "A crew of posthumans investigates an alien ship at the edge of the solar system and confronts a form of intelligence utterly unlike anything they imagined. A hard SF horror novel about consciousness and evolution.",
      publishedDate: new Date("2006-10-03"),
      isbn: "9780765319647",
      totalCopies: 2,
      copiesAvailable: 2,
    },
    {
      title: "Recursion",
      author: "Blake Crouch",
      genre: "Science Fiction",
      summary:
        "A neuroscientist and a detective uncover a terrifying technology that allows people to relive their memories—and inadvertently rewrite the timeline. A mind-bending thriller about memory, grief, and second chances.",
      publishedDate: new Date("2019-06-11"),
      isbn: "9781524759780",
      totalCopies: 4,
      copiesAvailable: 4,
    },

    // Fantasy (15)
    {
      title: "The Name of the Wind",
      author: "Patrick Rothfuss",
      genre: "Fantasy",
      summary:
        "Kvothe, legendary magician and musician, recounts his extraordinary life to a chronicler in a remote inn. The first book of the Kingkiller Chronicle is a beautifully written coming-of-age epic.",
      publishedDate: new Date("2007-03-27"),
      isbn: "9780756404741",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Way of Kings",
      author: "Brandon Sanderson",
      genre: "Fantasy",
      summary:
        "Three characters in a war-torn world pursue destiny, truth, and survival amid political betrayal and ancient supernatural forces. The opening volume of the epic Stormlight Archive series.",
      publishedDate: new Date("2010-08-31"),
      isbn: "9780765326355",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "A Wizard of Earthsea",
      author: "Ursula K. Le Guin",
      genre: "Fantasy",
      summary:
        "Young Ged attends a school for wizards on an archipelago and accidentally unleashes a dark shadow that pursues him across the world. A timeless fable about pride, humility, and self-knowledge.",
      publishedDate: new Date("1968-11-01"),
      isbn: "9780547773742",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Good Omens",
      author: "Terry Pratchett & Neil Gaiman",
      genre: "Fantasy",
      summary:
        "An angel and a demon who have grown fond of Earth team up to prevent the Apocalypse. A witty and warm comedy about good, evil, and the unlikely friendship that might save the world.",
      publishedDate: new Date("1990-05-01"),
      isbn: "9780060853983",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "The Shadow of the Wind",
      author: "Carlos Ruiz Zafón",
      genre: "Fantasy",
      summary:
        "A young boy in post-war Barcelona discovers a mysterious novel and sets out to find its reclusive author, uncovering a dark and tangled web of secrets. A gothic love letter to the power of books.",
      publishedDate: new Date("2001-04-01"),
      isbn: "9780143034902",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "American Gods",
      author: "Neil Gaiman",
      genre: "Fantasy",
      summary:
        "Ex-convict Shadow is drawn into a conflict between old gods brought to America by immigrants and the new gods of technology and media. A road novel and meditation on belief in modern America.",
      publishedDate: new Date("2001-06-19"),
      isbn: "9780062080233",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Lies of Locke Lamora",
      author: "Scott Lynch",
      genre: "Fantasy",
      summary:
        "Master thief Locke Lamora leads a gang of con artists in a Venice-like city until a mysterious criminal mastermind threatens everything they have. A brilliant, darkly funny heist story in a richly detailed fantasy world.",
      publishedDate: new Date("2006-06-27"),
      isbn: "9780553588941",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Jonathan Strange & Mr Norrell",
      author: "Susanna Clarke",
      genre: "Fantasy",
      summary:
        "In an alternate Regency England where magic has been forgotten, two magicians attempt to restore it—with very different methods and consequences. A meticulous, witty, and enthralling alternate history.",
      publishedDate: new Date("2004-09-08"),
      isbn: "9781582344171",
      totalCopies: 2,
      copiesAvailable: 2,
    },
    {
      title: "The Bear and the Nightingale",
      author: "Katherine Arden",
      genre: "Fantasy",
      summary:
        "A headstrong girl in medieval Russia defies her family and fights to protect her village against demons as the old spirits of the forest lose power to the new Christian church. A lush and atmospheric fairy tale.",
      publishedDate: new Date("2017-01-10"),
      isbn: "9781101885932",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Gardens of the Moon",
      author: "Steven Erikson",
      genre: "Fantasy",
      summary:
        "The first novel in the sprawling Malazan Book of the Fallen series follows soldiers, gods, and assassins caught in an empire's brutal wars. An uncompromising, richly imagined epic of staggering scope.",
      publishedDate: new Date("1999-04-01"),
      isbn: "9780765348784",
      totalCopies: 2,
      copiesAvailable: 2,
    },
    {
      title: "Circe",
      author: "Madeline Miller",
      genre: "Fantasy",
      summary:
        "The mythological witch Circe discovers her powers, battles monsters, and crosses paths with famous heroes of Greek legend. A feminist reimagining of the Odyssey world told with stunning prose.",
      publishedDate: new Date("2018-04-10"),
      isbn: "9780316556347",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Night Circus",
      author: "Erin Morgenstern",
      genre: "Fantasy",
      summary:
        "Two young magicians are pitted against each other in a competition neither fully understands, played out within a mysterious black-and-white circus that only appears at night. A dreamlike and enchanting novel.",
      publishedDate: new Date("2011-09-13"),
      isbn: "9780385534635",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Mistborn: The Final Empire",
      author: "Brandon Sanderson",
      genre: "Fantasy",
      summary:
        "In a world where ash falls from the sky and the Lord Ruler reigns as god, a young street thief joins a rebellion with an ingenious magic system at its heart. A thrilling heist epic with a stunning twist.",
      publishedDate: new Date("2006-07-17"),
      isbn: "9780765311788",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "The Priory of the Orange Tree",
      author: "Samantha Shannon",
      genre: "Fantasy",
      summary:
        "A queen without an heir, a dragon-rider hiding her true allegiance, and a mage from the East must unite to stop an ancient evil from awakening. A sweeping standalone fantasy of formidable scope.",
      publishedDate: new Date("2019-02-26"),
      isbn: "9781635570298",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Piranesi",
      author: "Susanna Clarke",
      genre: "Fantasy",
      summary:
        "A man lives in a vast, labyrinthine house filled with statues and tidal halls, keeping meticulous journals as he tries to understand his strange existence. A haunting mystery about memory and identity.",
      publishedDate: new Date("2020-09-15"),
      isbn: "9781635575637",
      totalCopies: 3,
      copiesAvailable: 3,
    },

    // Mystery/Thriller (15)
    {
      title: "Gone Girl",
      author: "Gillian Flynn",
      genre: "Mystery/Thriller",
      summary:
        "On their fifth wedding anniversary, Amy Dunne disappears and her husband Nick becomes the prime suspect. A dark, twisty psychological thriller told in alternating unreliable voices.",
      publishedDate: new Date("2012-06-05"),
      isbn: "9780307588364",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "The Girl with the Dragon Tattoo",
      author: "Stieg Larsson",
      genre: "Mystery/Thriller",
      summary:
        "Journalist Mikael Blomkvist and hacker Lisbeth Salander investigate a decades-old disappearance within a powerful Swedish family. A gripping mix of corporate corruption, family secrets, and cyber investigation.",
      publishedDate: new Date("2005-08-01"),
      isbn: "9780307454546",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "In the Woods",
      author: "Tana French",
      genre: "Mystery/Thriller",
      summary:
        "Detective Rob Ryan investigates a murder in an Irish village near the woods where he survived a childhood tragedy he can't remember. A literary mystery full of atmosphere and psychological tension.",
      publishedDate: new Date("2007-05-17"),
      isbn: "9780143113492",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "The Da Vinci Code",
      author: "Dan Brown",
      genre: "Mystery/Thriller",
      summary:
        "Harvard symbologist Robert Langdon is drawn into a conspiracy involving a murder in the Louvre and a secret society protecting the truth about the Holy Grail. A fast-paced treasure hunt through European history.",
      publishedDate: new Date("2003-03-18"),
      isbn: "9780307474278",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Big Little Lies",
      author: "Liane Moriarty",
      genre: "Mystery/Thriller",
      summary:
        "Three women's lives become entangled around a school fundraiser and culminate in a murder that none of them anticipated. A sharp, witty examination of marriage, friendship, and domestic secrets.",
      publishedDate: new Date("2014-07-29"),
      isbn: "9780425274866",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "And Then There Were None",
      author: "Agatha Christie",
      genre: "Mystery/Thriller",
      summary:
        "Ten strangers are lured to a remote island and begin to die one by one, with no apparent killer among them. The best-selling mystery novel of all time, a masterpiece of suspense.",
      publishedDate: new Date("1939-11-06"),
      isbn: "9780062073488",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "The Silence of the Lambs",
      author: "Thomas Harris",
      genre: "Mystery/Thriller",
      summary:
        "FBI trainee Clarice Starling must consult imprisoned cannibal Hannibal Lecter to catch a serial killer who skins his victims. A classic cat-and-mouse thriller driven by two unforgettable characters.",
      publishedDate: new Date("1988-05-01"),
      isbn: "9780312924584",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Sharp Objects",
      author: "Gillian Flynn",
      genre: "Mystery/Thriller",
      summary:
        "Reporter Camille Preaker returns to her hometown to cover the murders of two young girls and confronts her own dark past. A Southern Gothic thriller dripping with dread and family dysfunction.",
      publishedDate: new Date("2006-09-26"),
      isbn: "9780307341556",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "The Thursday Murder Club",
      author: "Richard Osman",
      genre: "Mystery/Thriller",
      summary:
        "Four residents of a retirement village meet weekly to investigate cold cases—until a real murder lands on their doorstep. A warm, witty mystery full of heart and surprising twists.",
      publishedDate: new Date("2020-09-03"),
      isbn: "9781984880963",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Secret History",
      author: "Donna Tartt",
      genre: "Mystery/Thriller",
      summary:
        "A group of Greek students at a Vermont college commit an act of violence and must live with the consequences. A dark academic thriller told in reverse, where the crime is revealed on the first page.",
      publishedDate: new Date("1992-09-16"),
      isbn: "9781400031702",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Behind Closed Doors",
      author: "B.A. Paris",
      genre: "Mystery/Thriller",
      summary:
        "Jack and Grace Angel appear to have the perfect marriage—but no one has ever been inside their home. A claustrophobic psychological thriller about a marriage built on terrifying secrets.",
      publishedDate: new Date("2016-02-11"),
      isbn: "9781250121004",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "The Woman in the Window",
      author: "A.J. Finn",
      genre: "Mystery/Thriller",
      summary:
        "An agoraphobic woman spies on her neighbors through her window and believes she witnesses a crime—but no one believes her. A Hitchcock-inspired thriller that questions the reliability of perception.",
      publishedDate: new Date("2018-01-02"),
      isbn: "9780062678416",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "The Firm",
      author: "John Grisham",
      genre: "Mystery/Thriller",
      summary:
        "A brilliant young law school graduate joins a lucrative Memphis firm and discovers it is a front for the mob. A taut legal thriller about a man who knows too much and is running out of options.",
      publishedDate: new Date("1991-02-01"),
      isbn: "9780440245926",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "I Am Pilgrim",
      author: "Terry Hayes",
      genre: "Mystery/Thriller",
      summary:
        "A retired American intelligence agent is drawn back into service to stop a bioterrorist from unleashing a plague. A globe-spanning spy thriller with impeccable research and relentless momentum.",
      publishedDate: new Date("2013-05-30"),
      isbn: "9781451689853",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Verity",
      author: "Colleen Hoover",
      genre: "Mystery/Thriller",
      summary:
        "Struggling writer Lowen Ashby discovers a hidden manuscript in the home of bestselling author Verity Crawford—and what she reads changes everything. A wickedly dark psychological thriller about truth and obsession.",
      publishedDate: new Date("2018-12-07"),
      isbn: "9781538724736",
      totalCopies: 5,
      copiesAvailable: 5,
    },

    // Romance (10)
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      genre: "Romance",
      summary:
        "Elizabeth Bennet navigates the pressures of marriage and society while falling for the proud and wealthy Mr. Darcy. The quintessential romance novel, sparkling with wit and social commentary.",
      publishedDate: new Date("1813-01-28"),
      isbn: "9780141439518",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Outlander",
      author: "Diana Gabaldon",
      genre: "Romance",
      summary:
        "A WWII combat nurse is transported back to 18th-century Scotland and finds herself caught between two worlds and two men. An epic, sweeping romance combining adventure, history, and passionate love.",
      publishedDate: new Date("1991-06-01"),
      isbn: "9780440212560",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Notebook",
      author: "Nicholas Sparks",
      genre: "Romance",
      summary:
        "A man reads a love story to a woman with dementia in a nursing home, the tale of a summer romance that defied family expectations decades earlier. A heartbreaking and tender story of enduring love.",
      publishedDate: new Date("1996-10-01"),
      isbn: "9780446676090",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "It Ends with Us",
      author: "Colleen Hoover",
      genre: "Romance",
      summary:
        "Lily meets the charming Ryle in Boston, and what begins as a perfect romance reveals itself to be far more complicated and painful than she imagined. A brave novel that handles difficult topics with compassion.",
      publishedDate: new Date("2016-08-02"),
      isbn: "9781501110368",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "The Hating Game",
      author: "Sally Thorne",
      genre: "Romance",
      summary:
        "Executive assistants Lucy and Josh share an office and a mutual hatred—or so they tell themselves. A delightfully witty enemies-to-lovers romance full of banter and tension.",
      publishedDate: new Date("2016-08-09"),
      isbn: "9780062439598",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Me Before You",
      author: "Jojo Moyes",
      genre: "Romance",
      summary:
        "Quirky, optimistic Louisa Clark becomes caregiver to the brilliant, once-adventurous Will Traynor and discovers a passionate world she never knew existed. A profoundly affecting story about living fully.",
      publishedDate: new Date("2012-01-05"),
      isbn: "9780143124542",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Kiss Quotient",
      author: "Helen Hoang",
      genre: "Romance",
      summary:
        "An econometrician with Asperger's hires a male escort to help her improve her relationship skills and falls for him instead. A fresh, heartfelt romance that celebrates neurodiversity and unconventional love.",
      publishedDate: new Date("2018-06-05"),
      isbn: "9780451490803",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Beach Read",
      author: "Emily Henry",
      genre: "Romance",
      summary:
        "A romance novelist and a literary fiction writer who hate each other's genres agree to swap styles for the summer—and end up swapping hearts. A clever, funny novel about love and the stories we tell ourselves.",
      publishedDate: new Date("2020-05-19"),
      isbn: "9781984806734",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Spanish Love Deception",
      author: "Elena Armas",
      genre: "Romance",
      summary:
        "Catalina Martín asks her infuriating American colleague Aaron Blackford to pretend to be her boyfriend at her sister's wedding in Spain. A slow-burn, enemies-to-lovers story full of heat and humor.",
      publishedDate: new Date("2021-02-23"),
      isbn: "9781982173340",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "People We Meet on Vacation",
      author: "Emily Henry",
      genre: "Romance",
      summary:
        "Alex and Poppy have been best friends for a decade, taking one annual trip together—until something went wrong two years ago. Told in alternating timelines, it's a moving story about love hiding in plain sight.",
      publishedDate: new Date("2021-05-11"),
      isbn: "9781984806758",
      totalCopies: 4,
      copiesAvailable: 4,
    },

    // Historical Fiction (10)
    {
      title: "The Pillars of the Earth",
      author: "Ken Follett",
      genre: "Historical Fiction",
      summary:
        "The building of a cathedral in 12th-century England becomes the backdrop for decades of ambition, passion, and violence. A sweeping, immersive epic of medieval life and human determination.",
      publishedDate: new Date("1989-10-01"),
      isbn: "9780451166890",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Book Thief",
      author: "Markus Zusak",
      genre: "Historical Fiction",
      summary:
        "Narrated by Death, the story follows a young girl living with a foster family in Nazi Germany who finds solace in books she steals. A profound and beautifully written tale of love, loss, and words.",
      publishedDate: new Date("2005-09-01"),
      isbn: "9780375842207",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "All the Light We Cannot See",
      author: "Anthony Doerr",
      genre: "Historical Fiction",
      summary:
        "A blind French girl and a German orphan's paths converge in occupied France during WWII. A Pulitzer Prize-winning novel of extraordinary beauty about the cost of war on ordinary lives.",
      publishedDate: new Date("2014-05-06"),
      isbn: "9781476746586",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Lincoln in the Bardo",
      author: "George Saunders",
      genre: "Historical Fiction",
      summary:
        "On the night President Lincoln visits his son's crypt, the ghosts in the graveyard grapple with their own unfinished business. A wildly original, moving novel about grief and the meaning of sacrifice.",
      publishedDate: new Date("2017-02-14"),
      isbn: "9780812985405",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "The Nightingale",
      author: "Kristin Hannah",
      genre: "Historical Fiction",
      summary:
        "Two sisters in Nazi-occupied France face the war in very different ways—one through resistance, one through endurance. A powerful tribute to the unsung heroism of women during WWII.",
      publishedDate: new Date("2015-02-03"),
      isbn: "9780312577223",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Wolf Hall",
      author: "Hilary Mantel",
      genre: "Historical Fiction",
      summary:
        "Thomas Cromwell rises from a blacksmith's son to become the most powerful man in Henry VIII's England. A Booker Prize–winning masterpiece of historical imagination told in vivid present tense.",
      publishedDate: new Date("2009-05-14"),
      isbn: "9780312429980",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Pachinko",
      author: "Min Jin Lee",
      genre: "Historical Fiction",
      summary:
        "Four generations of a Korean family navigate discrimination, war, and identity in Japan. An epic family saga spanning most of the 20th century, rich with love, sacrifice, and resilience.",
      publishedDate: new Date("2017-02-07"),
      isbn: "9781455563920",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Tattooist of Auschwitz",
      author: "Heather Morris",
      genre: "Historical Fiction",
      summary:
        "Based on the true story of Lale Sokolov, a Jewish Slovakian man who tattooed prisoners in Auschwitz—and fell in love. A remarkable and devastating story of survival and humanity at its extremes.",
      publishedDate: new Date("2018-01-11"),
      isbn: "9780062835673",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Memoirs of a Geisha",
      author: "Arthur Golden",
      genre: "Historical Fiction",
      summary:
        "A young girl from a fishing village is sold into service and rises to become one of Japan's most celebrated geisha in pre-WWII Kyoto. A lush, immersive portrait of a lost world.",
      publishedDate: new Date("1997-10-27"),
      isbn: "9780679781585",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Name of the Rose",
      author: "Umberto Eco",
      genre: "Historical Fiction",
      summary:
        "A Franciscan friar investigates a series of mysterious deaths in a 14th-century Italian monastery. A densely layered medieval murder mystery that doubles as a treatise on knowledge and heresy.",
      publishedDate: new Date("1980-10-01"),
      isbn: "9780151446476",
      totalCopies: 2,
      copiesAvailable: 2,
    },

    // Non-Fiction/Biography (10)
    {
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      genre: "Non-Fiction/Biography",
      summary:
        "From the Stone Age to the 21st century, Harari surveys the story of our species and the forces that shaped who we are. A sweeping, thought-provoking account of human history and its implications.",
      publishedDate: new Date("2011-01-01"),
      isbn: "9780062316097",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Educated",
      author: "Tara Westover",
      genre: "Non-Fiction/Biography",
      summary:
        "Tara Westover grew up in a survivalist family in rural Idaho, never attending school, and went on to earn a PhD from Cambridge. A stunning memoir about the transformative power of education.",
      publishedDate: new Date("2018-02-20"),
      isbn: "9780399590504",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Becoming",
      author: "Michelle Obama",
      genre: "Non-Fiction/Biography",
      summary:
        "The former First Lady of the United States reflects on her upbringing in Chicago, her time at the White House, and her ongoing effort to find her voice. An intimate and inspiring memoir.",
      publishedDate: new Date("2018-11-13"),
      isbn: "9781524763138",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "The Immortal Life of Henrietta Lacks",
      author: "Rebecca Skloot",
      genre: "Non-Fiction/Biography",
      summary:
        "The story of Henrietta Lacks, a Black woman whose cancer cells were taken without her knowledge in 1951 and became one of the most important cell lines in medical history. A gripping blend of science, ethics, and family.",
      publishedDate: new Date("2010-02-02"),
      isbn: "9781400052189",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      genre: "Non-Fiction/Biography",
      summary:
        "Hawking explores the nature of the universe, from the Big Bang to black holes to the possibility of a unified theory of everything. A landmark of popular science that made cosmology accessible to millions.",
      publishedDate: new Date("1988-04-01"),
      isbn: "9780553380163",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Diary of a Young Girl",
      author: "Anne Frank",
      genre: "Non-Fiction/Biography",
      summary:
        "Anne Frank's diary written while hiding in an Amsterdam attic with her family during the Nazi occupation of the Netherlands. One of the most powerful and widely read accounts of the Holocaust.",
      publishedDate: new Date("1947-06-25"),
      isbn: "9780553296983",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Born a Crime",
      author: "Trevor Noah",
      genre: "Non-Fiction/Biography",
      summary:
        "The Daily Show host recounts growing up mixed-race in apartheid South Africa—a crime punishable by law. A funny, raw, and moving memoir about race, family, and finding identity.",
      publishedDate: new Date("2016-11-15"),
      isbn: "9780399588198",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Autobiography of Malcolm X",
      author: "Malcolm X & Alex Haley",
      genre: "Non-Fiction/Biography",
      summary:
        "The life story of Malcolm X, from childhood poverty through crime, prison, Nation of Islam leadership, and his final evolution. A landmark work in African-American literature and political thought.",
      publishedDate: new Date("1965-10-13"),
      isbn: "9780345350688",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "When Breath Becomes Air",
      author: "Paul Kalanithi",
      genre: "Non-Fiction/Biography",
      summary:
        "A young neurosurgeon diagnosed with terminal lung cancer reflects on what makes life worth living. A profoundly moving meditation on mortality, meaning, and the privilege of being a doctor.",
      publishedDate: new Date("2016-01-12"),
      isbn: "9780812988406",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "I Know Why the Caged Bird Sings",
      author: "Maya Angelou",
      genre: "Non-Fiction/Biography",
      summary:
        "Maya Angelou recounts her childhood and adolescence in the American South and California, confronting racism, trauma, and the discovery of her voice. A classic of American autobiography.",
      publishedDate: new Date("1969-04-01"),
      isbn: "9780345514400",
      totalCopies: 4,
      copiesAvailable: 4,
    },

    // Horror (8)
    {
      title: "It",
      author: "Stephen King",
      genre: "Horror",
      summary:
        "A group of childhood friends reunite as adults to destroy an ancient, shapeshifting evil that lives in the sewers of their small Maine town. King's magnum opus of childhood fear and adult courage.",
      publishedDate: new Date("1986-09-15"),
      isbn: "9781501156700",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Shining",
      author: "Stephen King",
      genre: "Horror",
      summary:
        "Writer Jack Torrance takes a job as winter caretaker at the isolated Overlook Hotel, where his young son Danny senses terrible things lurking. A terrifying study of isolation, addiction, and psychic dread.",
      publishedDate: new Date("1977-01-28"),
      isbn: "9780307743657",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Haunting of Hill House",
      author: "Shirley Jackson",
      genre: "Horror",
      summary:
        "Four people gather in a notoriously haunted mansion to study paranormal phenomena, and one of them begins to lose her grip on reality. The definitive American haunted house story.",
      publishedDate: new Date("1959-10-16"),
      isbn: "9780143039983",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Dracula",
      author: "Bram Stoker",
      genre: "Horror",
      summary:
        "Count Dracula leaves Transylvania for England and the small band of people who stand against him. The definitive vampire novel, told in diaries, letters, and newspaper clippings.",
      publishedDate: new Date("1897-05-26"),
      isbn: "9780141439846",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Mexican Gothic",
      author: "Silvia Moreno-Garcia",
      genre: "Horror",
      summary:
        "A glamorous socialite travels to a remote Mexican mansion in 1950 to rescue her cousin and finds herself trapped in a nightmare of secrets and dark magic. A lush, intoxicating Gothic horror.",
      publishedDate: new Date("2020-06-30"),
      isbn: "9780525620785",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Bird Box",
      author: "Josh Malerman",
      genre: "Horror",
      summary:
        "Something unseen has driven most of the world insane. A woman must navigate a river blindfolded with two children, never knowing what lurks in the open. A relentlessly tense, original horror novel.",
      publishedDate: new Date("2014-05-13"),
      isbn: "9780062259653",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Frankenstein",
      author: "Mary Shelley",
      genre: "Horror",
      summary:
        "Young scientist Victor Frankenstein creates a living being from dead matter and is horrified by what he has made. The first science fiction novel and a timeless meditation on creation and responsibility.",
      publishedDate: new Date("1818-01-01"),
      isbn: "9780141439471",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Troop",
      author: "Nick Cutter",
      genre: "Horror",
      summary:
        "A group of Boy Scouts on a remote island encounter an emaciated stranger carrying a horrifying parasite. A brutally intense survivalist horror novel that tests the limits of endurance.",
      publishedDate: new Date("2014-02-25"),
      isbn: "9781476703664",
      totalCopies: 2,
      copiesAvailable: 2,
    },

    // Classic Literature (10)
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      genre: "Classic Literature",
      summary:
        "Lawyer Atticus Finch defends a Black man unjustly accused of rape in 1930s Alabama, seen through the eyes of his young daughter Scout. A landmark American novel about justice, morality, and growing up.",
      publishedDate: new Date("1960-07-11"),
      isbn: "9780061935466",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "1984",
      author: "George Orwell",
      genre: "Classic Literature",
      summary:
        "In a totalitarian superstate, low-ranking party member Winston Smith secretly rebels against the Party's omniscient surveillance. A defining dystopian novel whose language—Big Brother, doublethink—has entered reality.",
      publishedDate: new Date("1949-06-08"),
      isbn: "9780451524935",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      genre: "Classic Literature",
      summary:
        "Narrator Nick Carraway chronicles the obsessive pursuit of the American Dream by his enigmatic neighbor Jay Gatsby in the Jazz Age. A lyrical tragedy about wealth, illusion, and the impossibility of the past.",
      publishedDate: new Date("1925-04-10"),
      isbn: "9780743273565",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
      genre: "Classic Literature",
      summary:
        "A destitute student in St. Petersburg murders a pawnbroker and is consumed by guilt and psychological torment. A masterful exploration of morality, suffering, and redemption.",
      publishedDate: new Date("1866-01-01"),
      isbn: "9780140449136",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Wuthering Heights",
      author: "Emily Brontë",
      genre: "Classic Literature",
      summary:
        "The obsessive, destructive love between Heathcliff and Catherine Earnshaw echoes across two generations on the Yorkshire moors. A wild, passionate Gothic novel unlike anything before or since.",
      publishedDate: new Date("1847-12-01"),
      isbn: "9780141439556",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "One Hundred Years of Solitude",
      author: "Gabriel García Márquez",
      genre: "Classic Literature",
      summary:
        "Seven generations of the Buendía family in the fictional town of Macondo experience love, madness, war, and miracles. The defining work of magical realism and one of the greatest novels ever written.",
      publishedDate: new Date("1967-05-30"),
      isbn: "9780060883287",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Moby-Dick",
      author: "Herman Melville",
      genre: "Classic Literature",
      summary:
        "Captain Ahab's monomaniacal quest for the white whale that took his leg pulls narrator Ishmael along on a voyage of obsession and destruction. An encyclopedic, magnificent American epic.",
      publishedDate: new Date("1851-10-18"),
      isbn: "9780142437247",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Jane Eyre",
      author: "Charlotte Brontë",
      genre: "Classic Literature",
      summary:
        "Orphan Jane Eyre becomes governess at Thornfield Hall and falls in love with her brooding employer Mr. Rochester, hiding a terrible secret. A groundbreaking portrait of feminine independence and moral conviction.",
      publishedDate: new Date("1847-10-16"),
      isbn: "9780141441146",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Anna Karenina",
      author: "Leo Tolstoy",
      genre: "Classic Literature",
      summary:
        "An aristocratic Russian woman leaves her husband for a young officer and faces the social consequences. Tolstoy's richly human novel about love, society, faith, and the possibility of happiness.",
      publishedDate: new Date("1878-01-01"),
      isbn: "9780143035008",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "Invisible Man",
      author: "Ralph Ellison",
      genre: "Classic Literature",
      summary:
        "A nameless Black man narrates his journey from the American South to Harlem, made invisible by a society that refuses to see him. A National Book Award–winning masterwork of American identity.",
      publishedDate: new Date("1952-04-14"),
      isbn: "9780679732761",
      totalCopies: 3,
      copiesAvailable: 3,
    },

    // Self-Help (7)
    {
      title: "Atomic Habits",
      author: "James Clear",
      genre: "Self-Help",
      summary:
        "A practical guide to building good habits and breaking bad ones through small, incremental changes. Clear's framework of the four laws of behavior change has helped millions reshape their lives.",
      publishedDate: new Date("2018-10-16"),
      isbn: "9780735211292",
      totalCopies: 5,
      copiesAvailable: 5,
    },
    {
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      genre: "Self-Help",
      summary:
        "Nobel laureate Kahneman explores the two systems that drive the way we think—fast, intuitive thinking and slow, deliberate reasoning. A revelatory look at the biases and shortcuts that shape our decisions.",
      publishedDate: new Date("2011-10-25"),
      isbn: "9780374533557",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "The Power of Now",
      author: "Eckhart Tolle",
      genre: "Self-Help",
      summary:
        "Tolle argues that the key to enlightenment is being fully present in the moment and releasing identification with the thinking mind. A spiritual guide that has influenced millions in finding peace.",
      publishedDate: new Date("1997-01-01"),
      isbn: "9781577314806",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "How to Win Friends and Influence People",
      author: "Dale Carnegie",
      genre: "Self-Help",
      summary:
        "Carnegie's timeless guide to improving relationships, communication, and leadership through understanding human nature. The original self-help bestseller, still relevant decades after its publication.",
      publishedDate: new Date("1936-10-01"),
      isbn: "9780671027032",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Man's Search for Meaning",
      author: "Viktor E. Frankl",
      genre: "Self-Help",
      summary:
        "Psychiatrist Viktor Frankl describes life in Nazi death camps and the psychological method he developed to survive. A profound argument that meaning—not happiness—is the primary human motivation.",
      publishedDate: new Date("1946-01-01"),
      isbn: "9780807014271",
      totalCopies: 4,
      copiesAvailable: 4,
    },
    {
      title: "Deep Work",
      author: "Cal Newport",
      genre: "Self-Help",
      summary:
        "Newport argues that the ability to focus without distraction is a superpower in our increasingly distracted economy. A compelling case for carving out time for cognitively demanding, meaningful work.",
      publishedDate: new Date("2016-01-05"),
      isbn: "9781455586691",
      totalCopies: 3,
      copiesAvailable: 3,
    },
    {
      title: "The Subtle Art of Not Giving a F*ck",
      author: "Mark Manson",
      genre: "Self-Help",
      summary:
        "A counterintuitive approach to living a good life by focusing on what truly matters and accepting that life is inherently difficult. A blunt, honest antidote to the positivity movement.",
      publishedDate: new Date("2016-09-13"),
      isbn: "9780062457714",
      totalCopies: 4,
      copiesAvailable: 4,
    },
  ];

  const result = await prisma.book.createMany({
    data: books,
    skipDuplicates: true,
  });

  console.log(`Seeded ${result.count} books and 2 users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
