import { useState } from 'react'
import { FONT_CATEGORY_LABEL, FONTS } from '../model/catalog'
import { FONT_CATEGORIES, FONT_IDS, type FontCategory, type FontId } from '../model/types'
import { ChoiceGroup } from '../panels/controls'

/** Tipografías agrupadas por estilo, con una muestra del propio texto de la capa. */
export function FontPicker({ value, sample, onChange }: { value: FontId; sample: string; onChange: (id: FontId) => void }) {
  const [category, setCategory] = useState<FontCategory>(FONTS[value].category)
  const text = sample.replace(/\s+/g, ' ').trim().slice(0, 14) || 'Aa'

  return (
    <div className="font-picker">
      <ChoiceGroup<FontCategory>
        legend="Tipografía"
        variant="segmented"
        value={category}
        options={FONT_CATEGORIES.map((c) => ({ value: c, label: FONT_CATEGORY_LABEL[c] }))}
        onChange={setCategory}
      />
      <ChoiceGroup<FontId>
        legend={`Tipografías ${FONT_CATEGORY_LABEL[category].toLowerCase()}`}
        variant="tiles"
        value={value}
        options={FONT_IDS.filter((id) => FONTS[id].category === category).map((id) => ({
          value: id,
          label: (
            <span className="font-sample" style={{ fontFamily: `${FONTS[id].family}, ${FONTS[id].fallback}`, fontWeight: FONTS[id].weight }}>
              {text}
            </span>
          ),
          hint: FONTS[id].name,
        }))}
        onChange={onChange}
      />
    </div>
  )
}
