import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BmiCalculator } from '../components/BmiCalculator';
import type { BmiData } from '../types';

const mockBmiData: BmiData = {
  eyebrow: 'Free Health Tool',
  titleHtml: 'Know Your<br><em>BMI Instantly.</em>',
  description: 'Calculate your BMI here — free, instant, and honest.',
};

const mockOnPlanSelect = vi.fn();

describe('BmiCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering Tests ────────────────────────────────────────

  it('renders the section with eyebrow, title, and description', () => {
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);
    expect(screen.getByText('Free Health Tool')).toBeInTheDocument();
    expect(screen.getByText(mockBmiData.description)).toBeInTheDocument();
  });

  it('renders all form inputs (weight, height, age)', () => {
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);
    expect(screen.getByLabelText('Your Weight (kg)')).toBeInTheDocument();
    expect(screen.getByLabelText('Height (cm)')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
  });

  it('renders the calculate button', () => {
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);
    expect(screen.getByRole('button', { name: /calculate my bmi/i })).toBeInTheDocument();
  });

  it('does not show results before calculation', () => {
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);
    expect(screen.queryByText('Your BMI')).not.toBeInTheDocument();
  });

  // ─── Validation Tests ────────────────────────────────────────

  it('alerts when submitting with empty fields', () => {
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /calculate my bmi/i }));
    expect(window.alert).toHaveBeenCalledWith('Please enter valid weight and height.');
  });

  it('alerts when weight is zero', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    await user.type(screen.getByLabelText('Your Weight (kg)'), '0');
    await user.type(screen.getByLabelText('Height (cm)'), '170');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    expect(window.alert).toHaveBeenCalledWith('Please enter valid weight and height.');
  });

  it('alerts when height is zero', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    await user.type(screen.getByLabelText('Your Weight (kg)'), '70');
    await user.type(screen.getByLabelText('Height (cm)'), '0');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    expect(window.alert).toHaveBeenCalledWith('Please enter valid weight and height.');
  });

  // ─── BMI Calculation Tests ────────────────────────────────────

  it('calculates Underweight BMI correctly (BMI < 18.5)', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    // 45 kg, 170 cm => BMI = 45 / (1.7^2) = 15.6
    await user.type(screen.getByLabelText('Your Weight (kg)'), '45');
    await user.type(screen.getByLabelText('Height (cm)'), '170');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    expect(screen.getByText('15.6')).toBeInTheDocument();
    expect(screen.getByText('Underweight')).toBeInTheDocument();
    expect(screen.getByText(/below the healthy range/i)).toBeInTheDocument();
  });

  it('calculates Healthy Weight BMI correctly (18.5 <= BMI < 25)', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    // 70 kg, 175 cm => BMI = 70 / (1.75^2) = 22.9
    await user.type(screen.getByLabelText('Your Weight (kg)'), '70');
    await user.type(screen.getByLabelText('Height (cm)'), '175');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    expect(screen.getByText('22.9')).toBeInTheDocument();
    expect(screen.getByText('Healthy Weight ✓')).toBeInTheDocument();
    expect(screen.getByText(/healthy BMI range/i)).toBeInTheDocument();
  });

  it('calculates Overweight BMI correctly (25 <= BMI < 30)', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    // 85 kg, 175 cm => BMI = 85 / (1.75^2) = 27.8
    await user.type(screen.getByLabelText('Your Weight (kg)'), '85');
    await user.type(screen.getByLabelText('Height (cm)'), '175');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    expect(screen.getByText('27.8')).toBeInTheDocument();
    expect(screen.getByText('Overweight')).toBeInTheDocument();
    expect(screen.getByText(/structured weight-loss program/i)).toBeInTheDocument();
  });

  it('calculates High BMI correctly (BMI >= 30)', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    // 100 kg, 170 cm => BMI = 100 / (1.7^2) = 34.6
    await user.type(screen.getByLabelText('Your Weight (kg)'), '100');
    await user.type(screen.getByLabelText('Height (cm)'), '170');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    expect(screen.getByText('34.6')).toBeInTheDocument();
    expect(screen.getByText('High BMI')).toBeInTheDocument();
    expect(screen.getByText(/best time to start is right now/i)).toBeInTheDocument();
  });

  // ─── BMI at exact boundary values ────────────────────────────

  it('classifies BMI of exactly 18.5 as Healthy Weight', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    // 53.5 kg, 170 cm => BMI = 53.5 / (1.7^2) = 18.5 (approx)
    await user.type(screen.getByLabelText('Your Weight (kg)'), '53.5');
    await user.type(screen.getByLabelText('Height (cm)'), '170');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    expect(screen.getByText('Healthy Weight ✓')).toBeInTheDocument();
  });

  it('classifies BMI of exactly 25.0 as Overweight', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    // 72.25 kg, 170 cm => BMI = 72.25 / (1.7^2) = 25.0
    await user.type(screen.getByLabelText('Your Weight (kg)'), '72.25');
    await user.type(screen.getByLabelText('Height (cm)'), '170');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    expect(screen.getByText('Overweight')).toBeInTheDocument();
  });

  // ─── Progress Bar Tests ────────────────────────────────────────

  it('renders a progress bar with correct ARIA attributes after calculation', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    await user.type(screen.getByLabelText('Your Weight (kg)'), '70');
    await user.type(screen.getByLabelText('Height (cm)'), '175');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '55');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  // ─── Plan Select Callback Test ──────────────────────────────

  it('calls onPlanSelect with "Free Trial First" when plan link is clicked', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    await user.type(screen.getByLabelText('Your Weight (kg)'), '70');
    await user.type(screen.getByLabelText('Height (cm)'), '175');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));

    await user.click(screen.getByText(/get a custom plan/i));
    expect(mockOnPlanSelect).toHaveBeenCalledWith('Free Trial First');
  });

  // ─── Recalculation Test ─────────────────────────────────────

  it('updates result when recalculating with different values', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    // First: healthy weight
    await user.type(screen.getByLabelText('Your Weight (kg)'), '70');
    await user.type(screen.getByLabelText('Height (cm)'), '175');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));
    expect(screen.getByText('Healthy Weight ✓')).toBeInTheDocument();

    // Now change to overweight values
    await user.clear(screen.getByLabelText('Your Weight (kg)'));
    await user.type(screen.getByLabelText('Your Weight (kg)'), '85');
    await user.click(screen.getByRole('button', { name: /calculate my bmi/i }));
    expect(screen.getByText('Overweight')).toBeInTheDocument();
  });

  // ─── Input Interaction Tests ────────────────────────────────

  it('allows typing in all input fields', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator data={mockBmiData} onPlanSelect={mockOnPlanSelect} />);

    const weightInput = screen.getByLabelText('Your Weight (kg)');
    const heightInput = screen.getByLabelText('Height (cm)');
    const ageInput = screen.getByLabelText('Age');

    await user.type(weightInput, '72');
    await user.type(heightInput, '170');
    await user.type(ageInput, '24');

    expect(weightInput).toHaveValue(72);
    expect(heightInput).toHaveValue(170);
    expect(ageInput).toHaveValue(24);
  });
});
