import React, { useMemo } from 'react'
import get from 'lodash/get'
import compact from 'lodash/compact'
import Block from 'core/blocks/block/Block'
import FeaturesOverviewCirclePackingChart from 'core/charts/features/FeaturesOverviewCirclePackingChart'
import { useI18n } from 'core/i18n/i18nContext'
import { useEntities } from 'core/entities/entitiesContext'
import ChartContainer from 'core/charts/ChartContainer'
import variables from '../../../../config/variables.yml'

const getChartData = (data, getName, translate) => {
    const categories = variables.featuresCategories
    const sectionIds = Object.keys(categories)
    const sections = sectionIds.map((sectionId) => {
        const sectionFeatures = categories[sectionId]
        let features = data.filter((f) => sectionFeatures.includes(f.id))
        features = features.map((feature) => {
            const buckets = get(feature, 'experience.year.buckets')
            if (!buckets) {
                throw new Error(`Feature “${feature.id}” does not have any data associated.`)
            }

            let usageBucket = buckets.find((b) => b.id === 'used')
            if (!usageBucket) {
                usageBucket = { count: 0 }
            }

            let knowNotUsedBucket = buckets.find((b) => b.id === 'heard')
            if (!knowNotUsedBucket) {
                knowNotUsedBucket = { count: 0 }
            }

            return {
                id: feature.id,
                awareness: usageBucket.count + knowNotUsedBucket.count,
                usage: usageBucket.count,
                unusedCount: knowNotUsedBucket.count,
                name: feature.name,
                sectionId,
            }
        })

        return features.length
            ? {
                  id: sectionId,
                  isSection: true,
                  children: features,
                  name: translate(`sections.${sectionId}.title`),
              }
            : null
    })

    return {
        id: 'root',
        children: compact(sections),
    }
}

const FeaturesOverviewBlock = ({ block, data }) => {
    const { getName } = useEntities()
    const { translate } = useI18n()

    const chartData = useMemo(() => getChartData(data, getName, translate), [
        data,
        getName,
        translate,
    ])

    return (
        <Block
            block={{
                ...block,
                showLegend: true,
                bucketKeysName: 'features_simplified',
                title: translate('blocks.features_overview.title'),
                description: translate('blocks.features_overview.description'),
            }}
            data={chartData}
            className="FeaturesOverviewBlock"
            showDescription={true}
        >
            <ChartContainer vscroll={true}>
                <FeaturesOverviewCirclePackingChart
                    className="FeaturesOverviewChart"
                    data={chartData}
                    variant="allFeatures"
                />
            </ChartContainer>
        </Block>
    )
}

export default FeaturesOverviewBlock
