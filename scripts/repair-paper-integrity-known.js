#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const dataDir = path.join(__dirname, '../public/data')
const questionsPath = path.join(dataDir, 'questions.json')
const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'))

function question(id) {
  const item = data.questions.find((q) => q.id === id)
  if (!item) throw new Error(`Question not found: ${id}`)
  return item
}

function syncQuestionFile(item) {
  const file = path.join(dataDir, 'qfiles', `${item.id}.json`)
  if (!fs.existsSync(file)) return
  const standalone = JSON.parse(fs.readFileSync(file, 'utf8'))
  standalone.text = item.text
  fs.writeFileSync(file, `${JSON.stringify(standalone, null, 2)}\n`)
}

// The PDFs confirm that the 111 and 112 questions are different recurrences.
// Correct the OCR errors in the 112 transcription while the integrity detector
// is being made math-aware.
question('q-pp-cs-math-112-2').text =
  '(10%) Which solves a_n = -a_{n-1} + 6a_{n-2} for a_n in terms of a_0 = A and a_1 = B:\n' +
  '(A) 1/5[(-3)^n(2A - B) + 2^n(3A + B)]\n' +
  '(B) 1/5[(-3)^n(2A - B) + 2^n(3A - B)]\n' +
  '(C) 1/5[(-2)^n(3A - B) + 3^n(2A + B)]\n' +
  '(D) 1/5[(-2)^n(3A + B) + 3^n(2A + B)]\n' +
  '(E) 1/5[(-2)^n(3A - B) + 3^n(2A - B)]'

// These passages were already present. Explicit range headers let the reader
// and the integrity checker associate every dependent question with its text.
for (const [first, last] of [
  [16, 20],
  [21, 25],
  [26, 30],
  [46, 50],
]) {
  const item = question(`q-pp-im-en-112-${first}`)
  const header = `Questions ${first}-${last} refer to the following passage.`
  if (!item.text.startsWith(header)) item.text = `${header}\n\n${item.text}`
}

const imReading = question('q-pp-im-en-112-46')
imReading.text = imReading.text
  .replace('Francois-Eugène Vidocq', 'François-Eugène Vidocq')
  .replace(
    '(C) What not to do when writing a mystery story',
    '(C) What not to do when writing a good mystery story'
  )

const archArticle = `Questions 4-6 refer to the following article.

A large language model (LLM) is a machine learning algorithm that can perform a variety of natural language processing tasks. As ChatGPT has attracted more and more attention and LLM has demonstrated its importance, many manufacturers are optimizing computer architectures for LLM. Thus, benchmarks are developed to evaluate the performance of computers on LLMs. The following news article was published in IEEE Spectrum.

Intel and Nvidia Square Off in GPT-3 Time Trials
MLPerf provides LLM testbed for Nvidia's H100 and top Intel chipsets
By Samuel K. Moore, 28 Jun 2023

For the first time, a large language model—a key driver of recent AI hype and hope—has been added to MLPerf, a set of neural-network training tests. Computers built around Nvidia's H100 GPU and Intel's Habana Gaudi2 chips were the first to be tested on how quickly they could perform a modified training of GPT-3, the large language model behind ChatGPT.

A 3,584-GPU computer run as a collaboration between Nvidia and cloud provider CoreWeave performed this task in just under 11 minutes. The smallest entrant, a 256-Gaudi2 system, did it in a little over 7 hours. On a per-chip basis, H100 systems were 3.6 times as fast at the task as Gaudi2. However, the Gaudi2 computers were operating “with one hand tied behind their back,” says Jordan Plawner, senior director of AI products at Intel, because a capability called mixed precision has not yet been enabled on the chips.

Computer scientists have found that for GPT-3's type of neural network, called a transformer network, training can be greatly accelerated by doing parts of the process using less-precise arithmetic. Versions of 8-bit floating-point numbers (FP8) can be used in certain layers of the network, while more precise 16-bit or 32-bit numbers are needed in others. Figuring out which layers are which is the key. Both H100 and Gaudi2 were built with mixed-precision hardware, but it has taken time for each company's engineers to discover the right layers and enable them. Nvidia's system in the H100 is called the transformer engine, and it was fully engaged for the GPT-3 results.

[Figure: GPT-3 Benchmark Training. Time to train in minutes (smaller is better) for systems with 3,584, 768, 768, 512, 384, and 256 accelerators. The 3,584- and one 768-accelerator entries are cloud results with CoreWeave.]

Habana engineers will have Gaudi2's FP8 capabilities ready for GPT-3 training in September, says Plawner. At that point, he says, Gaudi2 will be “competitive” with H100, and he expects Gaudi2 to beat H100 on the combination of price and performance. Gaudi2 is made using the same process technology—7 nanometers—as the H100's predecessor, the A100.

Making GPT-3 work

Large language models “and generative AI have fundamentally changed how AI is used in the market,” says Dave Salvatore, Nvidia's director of AI benchmarking and cloud computing. So finding a way to benchmark these behemoths was important.

But turning GPT-3 into a useful industry benchmark was no easy task. A complete training of the full 175-billion-parameter network with an entire training dataset could take weeks and cost millions of dollars. “We wanted to keep the runtime reasonable,” says David Kanter, executive director of MLPerf's parent organization, MLCommons. “But this is still far and away the most computationally demanding of our benchmarks.” Most of the benchmark networks in MLPerf can be run on a single processor, but GPT-3 takes 64 at a minimum, he says.

Instead of training on an entire dataset, participants trained on a representative portion. And they did not train to completion, or convergence, in industry parlance. Instead, the systems trained to a point that indicated further training would lead to convergence.

Figuring out that point, the right fraction of data, and other parameters so that the benchmark is representative of the full training task took “a lot of experiments,” says Ritika Borkar, senior deep-learning architect at Nvidia and chair of the MLPerf training working group.

On Twitter, Abhi Venigalla, a research scientist at MosaicML, estimated that Nvidia and CoreWeave's 11-minute record would scale up to about two days of full-scale training.

H100 training records

This round of MLPerf wasn't just about GPT-3; the contest consists of seven other benchmark tests: image recognition; medical-imaging segmentation; two versions of object detection; speech recognition; natural-language processing; and recommendation. Each computer system is evaluated on the time it takes to train the neural network on a given dataset to a particular accuracy. They are placed into three categories: cloud-computing systems, available on-premises systems, and preview systems, which are scheduled to become available within six months.

[Figure: MLPerf Training v3.0 Results. Time to train in minutes across eight benchmarks; bubble size represents the total number of CPUs and GPUs in the system, and color represents GPU type.]

For these other benchmarks, Nvidia was largely involved in a proxy fight against itself. Most entrants were system makers such as Dell and Gigabyte, but nearly all used Nvidia GPUs. Eighty of 88 entries were powered by them, and about half of those used the H100, a chip made using Taiwan Semiconductor Manufacturing Co.'s 5-nanometer process that went to customers in the fourth quarter of 2022. Either Nvidia computers or those of CoreWeave set the records for each of the eight categories.

In addition to adding GPT-3, MLPerf significantly upgraded its recommender-system test to a benchmark called DLRM DCN-V2. “Recommendation is really a critical thing for the modern era, but it's often an unsung hero,” says Kanter. Because of the risk surrounding identifiable personal information in the dataset, “recommendation is in some ways the hardest thing to make a benchmark for,” he says.

The new DLRM DCN-V2 is meant to better match what industry is using. It requires five times the memory operations, and the network is similarly more computationally complex. The size of the dataset it is trained on is about four times as large as the 1-terabyte dataset its predecessor used.

Results: https://mlcommons.org/en/training-normal-30/.`

const archQuestion = question('q-pp-cs-arch-113-4')
if (!archQuestion.text.startsWith('Questions 4-6 refer')) {
  archQuestion.text = `${archArticle}\n\n${archQuestion.text}`
}

for (const id of [
  'q-pp-cs-math-112-2',
  'q-pp-im-en-112-16',
  'q-pp-im-en-112-21',
  'q-pp-im-en-112-26',
  'q-pp-im-en-112-46',
  'q-pp-cs-arch-113-4',
]) {
  syncQuestionFile(question(id))
}

fs.writeFileSync(questionsPath, `${JSON.stringify(data, null, 2)}\n`)
process.stdout.write('Repaired known paper-integrity records and synchronized qfiles.\n')
