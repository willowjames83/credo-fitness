import SwiftUI

struct ShareCardRenderer {

    // MARK: - PR Card

    @MainActor
    static func renderPRCard(
        exerciseName: String,
        weight: Double,
        reps: Int,
        estimated1RM: Double,
        date: Date,
        aspectRatio: AspectRatio
    ) -> UIImage? {
        let view = PRShareCard(
            exerciseName: exerciseName,
            weight: weight,
            reps: reps,
            estimated1RM: estimated1RM,
            date: date,
            aspectRatio: aspectRatio
        )
        return renderView(view, aspectRatio: aspectRatio)
    }

    // MARK: - Workout Summary Card

    @MainActor
    static func renderWorkoutSummaryCard(
        workout: CompletedWorkout,
        aspectRatio: AspectRatio
    ) -> UIImage? {
        let view = WorkoutSummaryShareCard(
            workout: workout,
            aspectRatio: aspectRatio
        )
        return renderView(view, aspectRatio: aspectRatio)
    }

    // MARK: - Credo Score Card

    @MainActor
    static func renderCredoScoreCard(
        score: Int,
        pillarScores: [(name: String, score: Int)],
        aspectRatio: AspectRatio
    ) -> UIImage? {
        let view = CredoScoreBadgeCard(
            score: score,
            pillarScores: pillarScores,
            aspectRatio: aspectRatio
        )
        return renderView(view, aspectRatio: aspectRatio)
    }

    // MARK: - Core Renderer

    @MainActor
    private static func renderView<V: View>(_ view: V, aspectRatio: AspectRatio) -> UIImage? {
        let renderer = ImageRenderer(content: view)

        // Set the proposed size to match the aspect ratio dimensions
        renderer.proposedSize = ProposedViewSize(
            width: aspectRatio.size.width,
            height: aspectRatio.size.height
        )

        // Render at 3x scale for retina quality
        renderer.scale = 3.0

        return renderer.uiImage
    }
}
