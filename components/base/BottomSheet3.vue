<script setup lang="ts">
import {
  useDraggable,
  useElementSize,
  useEventListener,
  useMouseInElement,
  useMousePressed,
  usePointer,
  useWindowSize,
} from '@vueuse/core'

type Event = TouchEvent | MouseEvent

const props = defineProps<{
  isShow?: boolean
  drugClassesCustom?: string
}>()

const emit = defineEmits<{
  (e: 'closed'): void
}>()

onMounted(() => {
  console.log('mounted')
})

// Settings
const config = {
  distanceBeforeClose: 60,
  pixelOffsetToStartClosing: 20,
  debug: true,
  distanceBeforeFullSize: 5,
}

const drugRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const initialHeight = ref(0)
const newHeight = ref(0)
const startDrugPosition = ref(0)
const startDrugHeight = ref(0)
const druggedDistance = ref(0)
const direction = ref<'up' | 'down' | 'scroll'>('up')

const { elementY } = useMouseInElement(containerRef)
const { elementHeight: drugHeight } = useMouseInElement(drugRef)
const { pressed } = useMousePressed({ target: drugRef.value })
const { height: windowHeight } = useWindowSize()

watch(pressed, () => {
  if (pressed.value) {
    startDrugPosition.value = elementY.value
    startDrugHeight.value = newHeight.value

    // const isBiggerThanWindow = newHeight.value >= windowHeight.value
    // const scroller = drugRef.value?.querySelector('.scroller')

    // if (!isBiggerThanWindow && scroller?.scrollTop === 0) {
    //   if (!scroller.classList.contains('pointer-events-none'))
    //     scroller.classList.add('pointer-events-none')
    // }

    // if (isBiggerThanWindow) {
    //   if (scroller?.classList.contains('pointer-events-none'))
    //     scroller.classList.remove('pointer-events-none')
    // }

    // if (scroller?.scrollTop !== 0)
    //   direction.value = 'scroll'
  }
  else {
    if (
      drugRef.value
      && direction.value === 'up'
      && newHeight.value > initialHeight.value
    ) {
      drugRef.value.style.height = `${windowHeight.value}px`
      newHeight.value = windowHeight.value
    }
    else if (
      drugRef.value
      && druggedDistance.value < config.distanceBeforeClose
      && direction.value === 'down'
    ) {
      emit('closed')
    }

    startDrugPosition.value = 0
    druggedDistance.value = 0
  }
})

watch(elementY, (current, prev) => {
  if (!pressed.value || !drugRef.value)
    return

  current > prev ? (direction.value = 'down') : (direction.value = 'up')

  druggedDistance.value = startDrugPosition.value - elementY.value
  newHeight.value = Math.ceil(startDrugHeight.value + druggedDistance.value)

  const isBiggerThanWindow = newHeight.value >= windowHeight.value
  const scroller = drugRef.value?.querySelector('.scroller')

  if (!isBiggerThanWindow && scroller?.scrollTop === 0) {
    if (!scroller.classList.contains('pointer-events-none'))
      scroller.classList.add('pointer-events-none')
  }

  if (isBiggerThanWindow) {
    if (scroller?.classList.contains('pointer-events-none'))
      scroller.classList.remove('pointer-events-none')
  }

  if (scroller?.scrollTop !== 0) {
    direction.value = 'scroll'
    return
  }

  if (isBiggerThanWindow) {
    drugRef.value.style.height = `${windowHeight.value}px`
    newHeight.value = windowHeight.value
    return
  }

  drugRef.value.style.height = `${newHeight.value}px`
})

watch(
  () => props.isShow,
  async () => {
    // Wait until child components renders to get height
    await nextTick()
    newHeight.value = drugHeight.value
    initialHeight.value = drugHeight.value
  },
  { immediate: true },
)

const handlerRef = ref<HTMLElement | null>(null)

function close() {
  emit('closed')
}
/**
 * On close modal
 */
function onClose() {
  // Scroll up all scroller blocks
  const scrollerBlocks = drug.value?.querySelectorAll('.scrollerBlock')
  scrollerBlocks?.forEach(el => (el.scrollTop = 0))
  drug.value?.removeEventListener('transitionend', onClose)
  opened.value = false
  emit('closed')
}

/**
 * Init modal
 */
async function init() {
  initialHeight.value = drug.value?.clientHeight ?? 0

  setTimeout(async () => {
    setInitialY()
    disabled.value = false
    addEvents()
    setTimeout(() => {
      open()
    }, 10)
  }, 10)
}
/**
 * Run init when mounted or isShow changed
 */
// watch(
//   () => props.isShow,
//   async () => {
//     if (props.isShow)
//       await init()

//     if (!props.isShow && opened.value)
//       close()
//   },
//   { immediate: true },
// )

/**
 * Height
 */
const drugClasses = computed(() => [
  // {
  //   'rounded-tl-xl rounded-tr-xl': drugHeight.value < windowHeight.value,
  //   'transition-opacity transition-transform duration-100':
  //     !isDragging.value && opened.value,
  //   'pointer-events-none': isDragging.value && drugStyles.value.transform,
  //   // 'transition-[height]': isHeightTrna.value,
  // },
  // props.drugClassesCustom,
])

const overflowClasses = computed(() => ({
  // 'transition-opacity duration-100': !isDragging.value && opened.value,
}))

const wrapClasses = computed(() => ({
  // 'pointer-events-none invisible opacity-0': !opened.value,
}))
</script>

<template>
  <div
    ref="containerRef"
    :class="wrapClasses"
    class="absolute inset-0 z-50 h-[full] w-full select-none overflow-hidden bg-red-500/50"
  >
    <!-- Overlay -->
    <div
      class="absolute inset-0 z-10 h-full w-full bg-foreground-1/70"
      @click="close()"
    />

    <!-- Drug -->
    <div
      ref="drugRef"
      :class="drugClassesCustom"
      class="drug h-50vh pointer-events-auto absolute bottom-0 left-1/2 z-10 w-full -translate-x-1/2 translate-y-0 overflow-hidden"
      @click.stop=""
    >
      <div ref="handlerRef">
        <slot name="handler" :close="close" />
      </div>

      <slot :close="close">
        <div class="scroller h-full overflow-y-auto p-10">
          <pre>pressed: {{ pressed }}</pre>
          <pre>
scroller: {{ drugRef?.querySelector(".scroller")?.clientHeight }}</pre>
          <pre>initialHeight: {{ initialHeight }}</pre>
          <pre>drugHeight: {{ drugHeight }}</pre>
          <pre>windowHeight: {{ windowHeight }}</pre>
          <pre>newHeight: {{ newHeight }}</pre>
          <pre>startDrugPosition: {{ startDrugPosition }}</pre>
          <pre>druggedDistance: {{ druggedDistance }}</pre>
          <pre>direction: {{ direction }}</pre>
          <div class="">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea
            recusandae unde fugiat beatae temporibus accusantium consequuntur,
            et ratione praesentium eligendi sunt neque, suscipit nam sed, vitae
            adipisci quia rerum! Consequatur praesentium itaque eum repellendus
            beatae a quae, voluptas labore est placeat vitae corporis
            accusantium. Perferendis deleniti ex minima neque eaque reiciendis.
            Quaerat velit ipsa tenetur nisi? Voluptate totam expedita
            praesentium minus recusandae, et explicabo reprehenderit rerum! Ipsa
            nesciunt blanditiis, ipsam nemo provident fugiat repellendus
            deleniti repellat vero tempora ullam ipsum vel? Ab, et est! Deleniti
            autem placeat omnis. Unde, iusto! Minus quisquam doloribus
            perferendis quam minima, suscipit in consequatur eius distinctio ea
            et eaque ipsam officiis, nostrum enim, facere numquam. Voluptatum
            praesentium vero iste repellendus hic dignissimos, veritatis ab
            voluptatem, eos cupiditate aliquid soluta. Nobis cupiditate fugit
            impedit unde nulla obcaecati delectus fugiat reiciendis possimus!
            Totam ratione eos dolor, nihil aut soluta quasi veniam veritatis
            ipsum nostrum dignissimos voluptate dolores pariatur molestias id
            quas deleniti architecto nesciunt in itaque error culpa voluptatem
            reprehenderit cum. Voluptatum quae totam fugiat pariatur hic. Sint
            vitae sequi reprehenderit, tempora molestiae cupiditate culpa
            excepturi consequatur neque iusto similique quia accusamus in
            accusantium id molestias iste odio animi nobis esse corrupti rem et
            repudiandae nam! Impedit magni cum dolorum repellat nostrum. Quaerat
            modi cum eius, voluptas inventore at repudiandae vero voluptate
            maxime odit ea. Aperiam corporis repudiandae ex dignissimos,
            eligendi ratione est temporibus cupiditate a quam neque pariatur
            sapiente veritatis excepturi vel illum optio, expedita,
            necessitatibus nulla. Dolores cupiditate magni debitis dolore iure
            sed quas aliquam non maxime obcaecati! Rerum odio enim error ea,
            corporis quis velit incidunt, deleniti repellendus minus cumque
            consectetur optio reprehenderit soluta natus, harum eligendi earum
            ex aut laborum magni. Possimus, quam? Sit, provident magnam?
            Possimus, deleniti asperiores, aspernatur eligendi repellendus a,
            cupiditate maiores soluta facere sunt officiis excepturi nihil. In
            nam eligendi at harum. Qui accusantium corporis doloribus libero
            saepe et nostrum, vel repellendus, ea hic excepturi voluptates,
            aspernatur ullam quae cum! Iste praesentium quis esse, quisquam
            exercitationem libero possimus nobis, rerum commodi debitis enim ea
            perspiciatis unde dolor dolores inventore magnam autem maiores
            dolore labore ipsa. Eos velit omnis cupiditate. Eos eligendi
            praesentium minus saepe nam accusantium architecto omnis tempora
            reprehenderit autem expedita ab ad nostrum magnam quae sit iure
            deserunt, dolorum obcaecati quaerat at ex. Ad temporibus dolorum ut.
            Esse corrupti saepe eveniet eius rem tempore aperiam assumenda
            pariatur, amet vitae reiciendis exercitationem. Aliquam dignissimos
            modi inventore quibusdam reiciendis sapiente sed quam? Omnis, at
            dolores veniam officia temporibus cum commodi eligendi doloremque
            dicta nesciunt, deleniti molestias eos pariatur quae, reiciendis
            reprehenderit voluptatem enim id eum? Officiis nisi quia minus. Sit
            illum suscipit facere molestiae eum, dicta architecto asperiores
            doloremque quisquam rem laudantium ipsa perspiciatis illo quia
            libero, obcaecati similique. Commodi rem obcaecati eaque quos iure
            numquam nam ea assumenda doloremque, quibusdam placeat atque nulla
            quisquam, cum non corporis optio aliquid quidem. Consequuntur
            voluptatibus alias porro tenetur eos, vero hic optio fugit harum?
            Dolores, laborum cupiditate minus qui est eos totam reiciendis non
            tenetur, at officia reprehenderit modi laboriosam voluptas explicabo
            iste culpa! Omnis ut sit et non earum assumenda sequi ex qui fugiat
            ea! Itaque maxime provident laudantium cupiditate dolorem. Nam
            nostrum, provident nisi ratione velit aliquam rem tempora, dicta
            reprehenderit excepturi nesciunt veritatis voluptates quibusdam quod
            ex. Molestiae quas repellat nesciunt sint, quisquam, veniam nulla
            maxime fuga distinctio consequatur provident sapiente ipsa harum
            iure incidunt recusandae culpa cum odit, saepe consectetur fugit!
            Libero, itaque sint? Velit quidem a perferendis id, sapiente,
            tempore consequatur animi, quasi corrupti ipsam doloribus laboriosam
            dolorem rem adipisci. Maiores, veniam cupiditate qui assumenda
            perferendis ipsum nobis ex ut similique recusandae eveniet impedit
            deserunt officia. Nulla totam nemo autem minus nihil ex maiores amet
            sequi, quae fugit ullam culpa deserunt possimus aperiam a sed
            tempore corrupti tempora minima. Rem quo repellendus enim. Doloribus
            sequi a dolore odit minima, possimus repellendus earum aliquam in.
            Quos eaque in repellat laudantium ab beatae ut temporibus provident
            id quisquam, dolorum qui eum accusamus vitae maiores quasi ad
            tempora magnam odit dolor? Accusamus voluptates officia esse,
            expedita aspernatur reprehenderit! Veniam, nobis iste repellat,
            dolorum quasi, praesentium et obcaecati exercitationem nam
            repellendus officia accusamus molestias ut incidunt distinctio fuga
            delectus numquam tempora officiis? Ad quaerat corporis molestiae
            sapiente illo! Dignissimos ex, necessitatibus deserunt illo eaque
            nam ducimus cum, minus voluptatem eveniet natus ratione deleniti,
            quibusdam nisi. Id tenetur minus recusandae reiciendis repellendus
            natus explicabo itaque, quam dolore ab aut quo in accusantium,
            distinctio cum illum enim accusamus alias maxime, omnis officiis
            dolor blanditiis velit. Repudiandae repellat dignissimos quibusdam
            mollitia ipsa voluptatem aspernatur nobis enim odio, suscipit
            voluptate! Inventore qui optio, perferendis numquam ex at quas. Quia
            accusamus ut quaerat accusantium delectus. Sint aut aperiam harum
            optio aliquam perferendis architecto, possimus, soluta cupiditate
            corporis esse, reprehenderit sit assumenda beatae maiores
            voluptatibus minus aliquid. Veniam deleniti officia quam sit maiores
            illum tempore ab dolores similique quibusdam minus aperiam
            reiciendis optio natus perferendis molestias, minima, porro
            recusandae ducimus quia ea saepe. Numquam expedita rerum, ullam
            maxime quia aut mollitia consequuntur minima. Dolore commodi,
            officia dolorem repellendus saepe laboriosam. Nisi pariatur,
            voluptatem consequatur possimus natus ex iusto similique, ab eveniet
            repellendus quam temporibus cupiditate omnis iure dolorum
            exercitationem numquam facere dicta quasi modi dolore adipisci odit.
            Accusamus iure, et nesciunt totam alias ratione aperiam harum
            deserunt amet, dolorum voluptas ipsam nam quas aspernatur
            accusantium! Quo, animi quia excepturi ex nihil reiciendis explicabo
            incidunt quos voluptates dolor consequuntur aliquid non iste maxime,
            officia eum! Ad voluptas iure quae sunt totam nam voluptates debitis
            eius, consequatur provident, dolor quam molestias neque eveniet
            earum et recusandae quaerat corrupti a fugiat veniam! Mollitia
            beatae neque expedita minima, molestias architecto amet dignissimos
            aut assumenda libero nobis quis facere pariatur ratione! Sit quaerat
            nobis neque ipsa. Aspernatur aut odit delectus tenetur amet, unde ad
            maiores est consequuntur. Ullam voluptatum eveniet unde, magni quos
            commodi inventore praesentium id excepturi nihil rem neque nemo ex
            tenetur totam, ipsam quia? Quis, amet temporibus aspernatur
            cupiditate ut exercitationem eos voluptates molestias deserunt
            consequatur harum obcaecati voluptate iste maxime quaerat tenetur
            rem voluptatum nostrum repellendus ratione.
          </div>
        </div>
        <!-- <div class="grid h-full select-none overflow-hidden overflow-y-auto scrollerBlock">
          <div ref="contentInside" class="flex flex-col gap-3">
            <div>
              initialHeight: {{ initialHeight }}
            </div>
            <div>
              Status: {{ debug.status }}
            </div>
            <div>
              Direction: {{ debug.direction }}
            </div>
            <div>
              DiffHeight: {{ diffHeight }}
            </div>
            <div>
              DiffHeightWithDebounce: {{ debug.diffHeightWithDebounce }}
            </div>
            <div>
              NextCurrentY: {{ debug.nextCurrentY }}
            </div>
            <div>
              drugStyles: {{ drugStyles }}
            </div>
            <div>
              overlayStyles: {{ overlayStyles }}
            </div>

            <div class="border-t border-b text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis alias similique delectus sequi iusto aspernatur harum natus quaerat tempora aut commodi maxime, praesentium itaque soluta reprehenderit velit odio qui perspiciatis? Dolorum impedit distinctio illum nisi optio ipsum accusantium delectus corporis, expedita officia consequatur quidem aut architecto earum suscipit, aspernatur omnis accusamus ut exercitationem, harum facere repellat eligendi asperiores et? Nihil provident doloremque vitae illo dignissimos qui error rerum quo praesentium minus quaerat cum, esse, nostrum, blanditiis quas! Nihil quae possimus ipsam aliquam autem amet corporis, totam officia enim libero vel rem, laborum sint aspernatur numquam veniam tempora fugiat doloremque? Quae adipisci doloremque porro libero nisi voluptatum vitae, perspiciatis magnam nulla, deserunt nam molestiae, eligendi iusto cum aliquam. Itaque id earum, natus culpa impedit ex possimus nisi ipsam inventore aut voluptas recusandae, nobis pariatur similique et? Non voluptates consequuntur pariatur odio est ex inventore quisquam sunt libero sequi sint aliquam adipisci velit officiis, assumenda praesentium ea quia, itaque eos autem nostrum! Quaerat sit, accusantium modi sint impedit cum consequatur excepturi aliquam expedita omnis, quos saepe eos, autem itaque explicabo ipsam illum. Voluptatibus facere laboriosam molestias aliquam delectus ipsam earum possimus temporibus, tempora ratione molestiae. Aperiam officia voluptates perspiciatis ea rerum mollitia eius autem, nostrum esse ipsum beatae ipsam vero aspernatur quaerat labore iusto quisquam cumque quos possimus tempore quidem accusantium? Totam debitis dignissimos asperiores, nemo magnam perferendis voluptate fugit ipsa modi! Unde consequuntur a adipisci dolorum. Id numquam sint, enim esse eos fugit. Libero eos obcaecati cum est quae optio architecto. Officiis facere iste illo reprehenderit officia et voluptatem non soluta molestias aliquam doloremque, dolores aspernatur, eligendi veritatis consequuntur cum possimus. Mollitia, quidem perferendis non sint assumenda quae deserunt ratione tempore blanditiis neque ex asperiores, tempora veritatis pariatur dolorum laborum molestias amet necessitatibus nemo saepe voluptatum dolor ipsum cum qui. Eaque laudantium enim ipsam ad eum dolores obcaecati magni dolor architecto sapiente asperiores labore molestiae consequuntur exercitationem dolorum ratione voluptatem veniam, nesciunt explicabo qui at sunt. Nemo quidem a nihil dignissimos voluptates eos culpa, laborum ratione sapiente cupiditate perferendis magni voluptatum hic qui quae non impedit nam numquam eaque, rem suscipit omnis tenetur. Numquam earum omnis suscipit officiis magnam. Eligendi recusandae quam impedit reiciendis voluptatem vitae, facilis omnis assumenda commodi nihil exercitationem, unde nostrum numquam inventore iste accusamus laborum quo illum repudiandae dolorem nesciunt, nemo eum hic. Repellendus, eligendi magnam quidem at ipsam, dolore esse corporis nulla excepturi officia labore exercitationem recusandae id eos modi dicta iste nobis sequi reprehenderit quasi ad sint eum ut. Error dolore cupiditate blanditiis maiores voluptatum consequuntur consectetur qui iste veniam amet quae sunt cum rem quos, dignissimos deserunt, voluptates aut excepturi labore modi animi vero suscipit nesciunt! Eaque explicabo magnam rerum accusamus nesciunt numquam a laboriosam molestiae perspiciatis nemo. Consequuntur quia aperiam a labore aliquam eligendi, quo nobis placeat corrupti ratione, inventore fugit tempore rerum facilis nam dignissimos laudantium vitae minima iusto suscipit odit ullam veniam. Sequi voluptatibus quaerat assumenda reprehenderit maiores ex inventore placeat accusantium doloremque aliquam. Rerum soluta ullam aperiam assumenda consequatur voluptatem.
            </div>
          </div>
        </div> -->
      </slot>
    </div>
  </div>
</template>
