import SwiftUI

@Observable
class ShareViewModel {

    // MARK: - Properties

    var content: ShareableContent?
    var aspectRatio: AspectRatio = .square
    var renderedImage: UIImage?
    var isRendering: Bool = false
    var isShareSheetPresented: Bool = false

    // MARK: - Methods

    @MainActor
    func render() {
        guard let content else {
            renderedImage = nil
            return
        }

        isRendering = true

        switch content {
        case let .personalRecord(exerciseName, weight, reps, estimated1RM, date):
            renderedImage = ShareCardRenderer.renderPRCard(
                exerciseName: exerciseName,
                weight: weight,
                reps: reps,
                estimated1RM: estimated1RM,
                date: date,
                aspectRatio: aspectRatio
            )

        case let .workoutSummary(workout):
            renderedImage = ShareCardRenderer.renderWorkoutSummaryCard(
                workout: workout,
                aspectRatio: aspectRatio
            )

        case let .credoScore(score, pillars):
            renderedImage = ShareCardRenderer.renderCredoScoreCard(
                score: score,
                pillarScores: pillars,
                aspectRatio: aspectRatio
            )
        }

        isRendering = false
    }

    func toggleAspectRatio() {
        aspectRatio = aspectRatio == .square ? .story : .square
    }

    func share() {
        guard renderedImage != nil else { return }
        isShareSheetPresented = true
    }
}
