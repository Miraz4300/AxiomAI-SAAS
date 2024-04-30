<script setup lang='ts'>
import { ref } from 'vue'
import { NButton, NModal, NScrollbar } from 'naive-ui'

const props = defineProps({
  footer: {
    type: Boolean,
    default: false,
  },
  modal: {
    type: Boolean,
    default: false,
  },
  span: {
    type: Boolean,
    default: false,
  },
})

const tosModal = ref(false)
</script>

<template>
  <div v-if="props.footer" class="flex gap-3 py-3 text-xs text-gray-500 font-normal">
    <a class="cursor-pointer" @click="tosModal = true">Terms of service</a>
    <span class="text-gray-600">|</span>
    <a>Deepspacelab corp</a>
  </div>
  <span v-if="props.span" class="text-[#fb923c] dark:text-[#F59E0B] font-semibold cursor-pointer" @click="tosModal = true">
    terms of service
  </span>

  <NModal v-if="props.modal" v-model:show="tosModal" style="width: 95%; max-width: 1280px; height: 95%; max-height: 640px">
    <div class="max-[640px]:p-5 min-[768px]:p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-6">
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            Terms of Service (ToS)
          </h2>
          <NScrollbar style="max-height: 490px">
            <div class="md:text-justify pl-4 pr-4 prose dark:prose-dark">
              <p>
                Before using the services provided by this website (AxiomAI), please be sure to carefully read and understand these Terms of Service (hereinafter referred to as "these Terms").
                <br>
                <br>
                Please be aware that if you choose to continue to visit this website (AxiomAI), or use the services provided by this website (AxiomAI), or use this website (AxiomAI) in various ways (hereinafter collectively referred to as "the Service"), you will be deemed to have accepted and agreed to the entire content of these Terms.
              </p>
              <br>
              <ol>
                <li>
                  1. This website (AxiomAI) is designed to help you work and study more efficiently and solve the problems you encounter in your work and study. In order to maintain the security and healthy development of the Internet, as well as protect your personal rights and interests, we solemnly remind you: when using this service, you must act in good faith and with caution; you must not use this service to intentionally or negligently endanger national security and activities prohibited by laws and administrative regulations such as social public interests, disrupting economic order and social order, infringing on the legitimate rights and interests of others, etc. Please do not input, generate, publish, export, or disseminate content that involves the following content prohibited by national laws and regulations:
                  <br>
                  <br>
                  <ul class="list-disc ml-8">
                    <li>Endangering national security, leaking state secrets, subverting state power, and undermining national unity</li>
                    <li>Damaging national honor and interests</li>
                    <li>Distort, vilify, blaspheme or deny the deeds and spirit of heroes and martyrs, insult, slander or otherwise infringe on the names, portraits, reputation and honor of heroes and martyrs</li>
                    <li>Promote terrorism or extremism or incite the implementation of terrorist activities or extremist activities</li>
                    <li>Inciting ethnic hatred, ethnic discrimination, and undermining ethnic unity</li>
                    <li>Undermining national religious policies and promoting cults and feudal superstitions</li>
                    <li>Spread rumors and disrupt economic and social order</li>
                    <li>Spread obscenity, pornography, gambling, violence, murder, terror or instigate crime</li>
                    <li>Insulting or slandering others, infringing on other's reputation, privacy and other legitimate rights and interests</li>
                    <li>Contains content that is false, harmful, threatening, intrusive on others' privacy, harassing, infringing, defamatory, vulgar, obscene, or otherwise morally objectionable</li>
                    <li>Other contents restricted or prohibited by Chinese laws, regulations, rules, regulations and any legally binding norms</li>
                  </ul>
                </li>
                <br>
                <li>2. You agree and promise that when using this service, you will strictly abide by the relevant laws and regulations of the country and industry, and will not upload confidential documents and data related to the country and the financial industry, and will not upload non-public information and data, customer information, and payment and settlement basis. No personal privacy information will be entered into the core code of the facility or system.</li>
                <br>
                <li>3. In order to limit sensitive content to the maximum extent and ensure service continuity, we have the right to refuse to reply to questions involving sensitive information. If the reply contains sensitive information, we will filter or delete the sensitive content. We cannot guarantee the integrity of the reply. At the same time, your IP will be recorded. If illegal use is found, this site will fully cooperate with the relevant departments to crack down!</li>
                <br>
                <li>4. To protect your personal privacy, please keep your personally identifiable data properly to avoid leakage.</li>
                <br>
                <li>5. You confirm and understand that all content generated by this service is generated by artificial intelligence models, so unexpected and wrong situations may occur. Please make sure to check the facts. We are not responsible for the accuracy, completeness and functionality of the generated content. We cannot make any guarantees, and the content generated does not represent our attitudes or opinions, is only to provide more information, and does not constitute any advice or commitment. We do not assume any form of responsibility for all actions you take based on the information provided by this service, unless there is an explicit written commitment document.</li>
                <br>
                <li>6. This service comes from the accumulation of information permitted by laws and regulations, including but not limited to the public Internet. Due to the open nature of the Internet, it is not ruled out that some of the information may be defective, unreasonable, or cause discomfort. If you encounter this situation, you are welcome and thank you for reporting it through the contact information at any time.</li>
                <br>
                <li>7. Under no circumstances will this website (AxiomAI) be liable for any damages due to network connection failure, power failure, strike, labor dispute, riot, uprising, riot, fire, flood, storm, explosion, force majeure, war, government action, international or domestic The service cannot be accessed, service interruption, information and data delays, stagnation or errors caused by court orders, hacker attacks, Internet viruses, network operator technical adjustments, temporary government controls or any other reasons beyond reasonable control, and cannot be provided. or liability for delays in providing services.</li>
              </ol>
              <br>
              <p>
                When this service recommends content from other websites in the form of links, we are not responsible for the availability of those websites or resources, and do not guarantee the authenticity and legality of any content, products, services or other materials obtained from those websites. To the extent permitted by law, this website is not liable for any direct, indirect, incidental, subordinate, special, consequential, punitive or exemplary damages arising from your use of the information or any links provided by this service.
              </p>
            </div>
          </NScrollbar>
        </header>
        <div class="flex justify-end">
          <NButton text type="primary" ghost @click="tosModal = false">
            ✓ Mark as read
          </NButton>
        </div>
      </div>
    </div>
  </NModal>
</template>
